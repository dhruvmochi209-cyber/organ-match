from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Donor, Recipient, MatchRequest, User, Hospital
from models.approval import Approval
from utils.db import db
from utils.helpers import log_audit
from services.matching_service import find_best_matches, generate_compatibility_explanation, calculate_match_score, predict_risk_level

match_bp = Blueprint('match', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get_or_404(user_id)

@match_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_matches():
    """Trigger AI matching for a specific donor."""
    user = get_current_user()
    data = request.get_json()
    donor_id = data.get('donor_id')

    donor = Donor.query.get_or_404(donor_id)
    if donor.verification_status != 'Verified':
        return jsonify({'error': 'Donor must be verified before matching'}), 400

    # ✅ FIX: Ensure donor isn't already part of a completed or in-progress match
    already_matched_donor = MatchRequest.query.filter(
        MatchRequest.donor_id == donor.id, 
        MatchRequest.status.in_(['Completed', 'In Progress'])
    ).first()
    if already_matched_donor:
        return jsonify({'error': 'Donor is already part of an active or completed transplant'}), 400

    # ✅ FIX: Only fetch recipients who are verified and NOT already part of a completed/in-progress match
    matched_recipient_ids = [m.recipient_id for m in MatchRequest.query.filter(MatchRequest.status.in_(['Completed', 'In Progress'])).all()]
    recipients = Recipient.query.filter(
        Recipient.verification_status == 'Verified',
        ~Recipient.id.in_(matched_recipient_ids)
    ).all()

    matches = find_best_matches(donor, recipients, top_n=5)

    if not matches:
        return jsonify({'message': 'No compatible matches found', 'matches': []}), 200

    created_matches = []
    for m in matches:
        recipient = m['recipient']
        
        hospital = Hospital.query.get(donor.hospital_id) if donor.hospital_id else None
        
        # Check if match already exists
        existing = MatchRequest.query.filter_by(donor_id=donor.id, recipient_id=recipient.id).first()
        if existing:
            # Match exists, ensure this hospital has an approval routing for it
            if hospital:
                existing_app = Approval.query.filter_by(match_id=existing.id, hospital_id=hospital.id).first()
                if not existing_app:
                    approval = Approval(match_id=existing.id, hospital_id=hospital.id)
                    db.session.add(approval)
                    created_matches.append(existing)
            continue

        match_req = MatchRequest(
            donor_id=donor.id,
            recipient_id=recipient.id,
            match_score=m['score'],
            risk_level=m['risk'],
            status='Pending'
        )
        db.session.add(match_req)
        db.session.flush()

        if hospital:
            approval = Approval(match_id=match_req.id, hospital_id=hospital.id)
            db.session.add(approval)

        created_matches.append(match_req)

    db.session.commit()
    log_audit(db, user.id, 'MATCHES_GENERATED', f"Generated {len(created_matches)} matches for donor {donor_id}")
    return jsonify({'message': f'{len(created_matches)} matches generated', 'matches': [m.to_dict() for m in created_matches]}), 201

@match_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_matches():
    user = get_current_user()
    matches = MatchRequest.query.all()
    result = []
    for m in matches:
        donor = Donor.query.get(m.donor_id)
        recipient = Recipient.query.get(m.recipient_id)
        
        # ✅ FIX: Only include if both parties and their user accounts exist
        if donor and donor.user and recipient and recipient.user:
            data = m.to_dict()
            data['donor_name'] = donor.full_name
            data['recipient_name'] = recipient.full_name
            data['organ'] = donor.organ_to_donate
            # ✅ RECALCULATE risk level dynamically to match the new logic
            data['risk_level'] = predict_risk_level(donor, recipient, m.match_score)
            data['explanation'] = generate_compatibility_explanation(donor, recipient, m.match_score)
            result.append(data)
    return jsonify(result), 200

@match_bp.route('/<int:match_id>', methods=['GET'])
@jwt_required()
def get_match_detail(match_id):
    m = MatchRequest.query.get_or_404(match_id)
    donor = Donor.query.get(m.donor_id)
    recipient = Recipient.query.get(m.recipient_id)
    data = m.to_dict()
    data['donor'] = donor.to_dict() if donor else {}
    data['recipient'] = recipient.to_dict() if recipient else {}
    data['explanation'] = generate_compatibility_explanation(donor, recipient, m.match_score) if donor and recipient else ''
    return jsonify(data), 200

@match_bp.route('/my-matches', methods=['GET'])
@jwt_required()
def get_my_matches():
    user = get_current_user()
    if user.role == 'donor':
        donor = Donor.query.filter_by(user_id=user.id).first()
        if not donor:
            return jsonify([]), 200
        matches = MatchRequest.query.filter_by(donor_id=donor.id).all()
    elif user.role == 'recipient':
        recipient = Recipient.query.filter_by(user_id=user.id).first()
        if not recipient:
            return jsonify([]), 200
        matches = MatchRequest.query.filter_by(recipient_id=recipient.id).all()
    else:
        matches = MatchRequest.query.all()

    result = []
    for m in matches:
        donor = Donor.query.get(m.donor_id)
        recipient = Recipient.query.get(m.recipient_id)
        
        # ✅ FIX: Only include if both parties and their user accounts still exist
        if donor and donor.user and recipient and recipient.user:
            d = m.to_dict()
            # ✅ RECALCULATE risk level dynamically for dashboard view
            d['risk_level'] = predict_risk_level(donor, recipient, m.match_score)
            d['explanation'] = generate_compatibility_explanation(donor, recipient, m.match_score)
            result.append(d)
            
    return jsonify(result), 200
