from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Hospital, User, Donor, Recipient, MatchRequest
from models.report import Report
from models.payment import Payment
from utils.db import db
from utils.helpers import log_audit
from datetime import datetime

hospital_bp = Blueprint('hospital', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get_or_404(user_id)

@hospital_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_hospitals():
    hospitals = Hospital.query.filter_by(certification_status='Certified').all()
    return jsonify([h.to_dict() for h in hospitals]), 200

@hospital_bp.route('/register', methods=['POST'])
@jwt_required()
def register_hospital():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    if not data.get('name') or not data.get('location'):
        return jsonify({'error': 'Missing required fields'}), 400
    if Hospital.query.filter_by(user_id=user.id).first():
        return jsonify({'error': 'Hospital profile already exists'}), 409

    hospital = Hospital(user_id=user.id, name=data['name'], location=data['location'])
    db.session.add(hospital)
    db.session.commit()
    log_audit(db, user.id, 'HOSPITAL_REGISTERED', f"Hospital '{data['name']}' registered")
    return jsonify({'message': 'Hospital registered', 'hospital': hospital.to_dict()}), 201

@hospital_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_current_user()
    hospital = Hospital.query.filter_by(user_id=user.id).first()
    if not hospital:
        return jsonify({'error': 'Hospital profile not found'}), 404
    return jsonify(hospital.to_dict()), 200

@hospital_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    # ✅ FIX: Fetch IDs of donors and recipients who have already completed a transplant or are in progress
    matched_donor_ids = [m.donor_id for m in MatchRequest.query.filter(MatchRequest.status.in_(['Completed', 'In Progress'])).all()]
    matched_recipient_ids = [m.recipient_id for m in MatchRequest.query.filter(MatchRequest.status.in_(['Completed', 'In Progress'])).all()]

    # Show only "LIVE" verified donors and recipients (those not already matched)
    all_donors = Donor.query.filter(
        Donor.verification_status == 'Verified',
        ~Donor.id.in_(matched_donor_ids)
    ).all()
    
    all_recipients = Recipient.query.filter(
        Recipient.verification_status == 'Verified',
        ~Recipient.id.in_(matched_recipient_ids)
    ).all()
    
    # Only include if base User still exists
    active_donors = [d for d in all_donors if d.user]
    active_recipients = [r for r in all_recipients if r.user]
                
    return jsonify({
        'donors': [d.to_dict() for d in active_donors], 
        'recipients': [r.to_dict() for r in active_recipients]
    }), 200


@hospital_bp.route('/pending-reports', methods=['GET'])
@jwt_required()
def get_pending_reports():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    reports = Report.query.filter_by(status='Pending', report_type='Medical').all()
    return jsonify([r.to_dict() for r in reports]), 200

@hospital_bp.route('/verify-report/<int:report_id>', methods=['POST'])
@jwt_required()
def verify_report(report_id):
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    report = Report.query.get_or_404(report_id)
    decision = data.get('decision')  # Verified or Rejected
    if decision not in ['Verified', 'Rejected']:
        return jsonify({'error': 'Invalid decision'}), 400
    report.status = decision
    db.session.commit()
    log_audit(db, user.id, 'REPORT_VERIFIED', f"Report {report_id} marked as {decision}")
    return jsonify({'message': f'Report {decision}', 'report': report.to_dict()}), 200

@hospital_bp.route('/approve-match/<int:match_id>', methods=['POST'])
@jwt_required()
def approve_match(match_id):
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    from models.approval import Approval
    data = request.get_json()
    hospital = Hospital.query.filter_by(user_id=user.id).first()
    approval = Approval.query.filter_by(match_id=match_id, hospital_id=hospital.id).first()
    if not approval:
        return jsonify({'error': 'Approval record not found'}), 404

    decision = data.get('decision')
    if decision not in ['Approved', 'Rejected']:
        return jsonify({'error': 'Invalid decision'}), 400

    approval.hospital_decision = decision
    approval.hospital_reason = data.get('reason', '')

    match = MatchRequest.query.get(match_id)
    if decision == 'Approved':
        match.status = 'Hospital Approved'
    else:
        match.status = 'Rejected'

    db.session.commit()
    log_audit(db, user.id, 'HOSPITAL_MATCH_DECISION', f"Match {match_id} {decision} by hospital {hospital.id}")
    return jsonify({'message': f'Match {decision}'}), 200

@hospital_bp.route('/diag', methods=['GET'])
def diag():
    return jsonify({'status': 'ok', 'message': 'Hospital BP is alive'}), 200

@hospital_bp.route('/update-match-status/<int:match_id>', methods=['POST'])
@jwt_required()
def update_match_status(match_id):
    try:
        user_identity = get_jwt_identity()
        user_id = int(user_identity)
        user = User.query.get(user_id)
        if user.role != 'hospital_admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json()
        new_status = data.get('status')
        if new_status not in ['In Progress', 'Completed', 'Rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        
        match = MatchRequest.query.get(match_id)
        if new_status == 'In Progress' and not match.is_transport_paid:
            return jsonify({'error': 'Transport Fee not paid yet. Cannot start surgery.'}), 402
        
        match.status = new_status
        db.session.commit()
        return jsonify({'message': f'Status updated to {new_status}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_bp.route('/matches', methods=['GET'])
@jwt_required()
def get_hospital_matches():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    from models.approval import Approval
    hospital = Hospital.query.filter_by(user_id=user.id).first()
    if not hospital:
        return jsonify({'error': 'Hospital not found'}), 404
    
    # ✅ FIX: Fetch all approvals and then filter out completed/rejected matches for a "LIVE" view
    approvals = Approval.query.filter_by(hospital_id=hospital.id).all()
    result = []
    for a in approvals:
        m = MatchRequest.query.get(a.match_id)
        # ✅ FIX: Only include active matches (Not Completed and Not Rejected) 
        # that have existing user accounts
        if m and m.status not in ['Completed', 'Rejected'] and \
           m.donor and m.donor.user and m.recipient and m.recipient.user:
            result.append({**m.to_dict(), 'approval': a.to_dict()})
    return jsonify(result), 200

@hospital_bp.route('/pending-patients', methods=['GET'])
@jwt_required()
def get_pending_patients():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    pending_donors = Donor.query.filter_by(verification_status='Pending', is_paid=True).all()
    pending_recipients = Recipient.query.filter_by(verification_status='Pending', is_paid=True).all()
    return jsonify({
        'donors': [d.to_dict() for d in pending_donors if d.user],
        'recipients': [r.to_dict() for r in pending_recipients if r.user]
    }), 200

@hospital_bp.route('/verify-donor/<int:donor_id>', methods=['POST'])
@jwt_required()
def verify_donor(donor_id):
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    donor = Donor.query.get_or_404(donor_id)
    donor.verification_status = data.get('status')
    db.session.commit()
    log_audit(db, user.id, 'DONOR_VERIFIED_HOSPITAL', f"Donor {donor_id} verified")
    return jsonify({'message': 'Donor updated'}), 200

@hospital_bp.route('/verify-recipient/<int:recipient_id>', methods=['POST'])
@jwt_required()
def verify_recipient(recipient_id):
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    recipient = Recipient.query.get_or_404(recipient_id)
    recipient.verification_status = data.get('status')
    db.session.commit()
    log_audit(db, user.id, 'RECIPIENT_VERIFIED_HOSPITAL', f"Recipient {recipient_id} verified")
    return jsonify({'message': 'Recipient updated'}), 200

@hospital_bp.route('/transplants', methods=['GET'])
@jwt_required()
def get_completed_transplants():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    completed_matches = MatchRequest.query.filter_by(status='Completed').all()
    # ✅ FIX: Only include if main User accounts still exist
    result = []
    for m in completed_matches:
        if m.donor and m.donor.user and m.recipient and m.recipient.user:
            result.append(m.to_dict())
    return jsonify(result), 200

@hospital_bp.route('/billing', methods=['GET'])
@jwt_required()
def get_hospital_billing():
    user = get_current_user()
    if user.role != 'hospital_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    hospital = Hospital.query.filter_by(user_id=user.id).first()
    if not hospital:
        return jsonify({'error': 'Hospital not found'}), 404
        
    payments = Payment.query.filter_by(hospital_id=hospital.id).all()
    return jsonify([p.to_dict() for p in payments]), 200
