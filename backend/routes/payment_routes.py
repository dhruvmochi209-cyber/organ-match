from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import db
from models import User, Hospital, Payment, MatchRequest
import random
import string
from datetime import datetime

payment_bp = Blueprint('payment', __name__)

def generate_transaction_id():
    return 'TXN-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

@payment_bp.route('/pay', methods=['POST'])
@jwt_required()
def process_payment():
    """
    Mock payment processing endpoint for all purposes.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    amount = data.get('amount')
    purpose = data.get('purpose')
    match_id = data.get('match_id')
    
    txn_id = generate_transaction_id()
    
    # AUTO-LINK HOSPITAL
    target_hospital_id = None
    if user.hospital_profile:
        target_hospital_id = user.hospital_profile.id
    elif user.donor_profile and user.donor_profile.hospital_id:
        target_hospital_id = user.donor_profile.hospital_id
    elif user.recipient_profile and user.recipient_profile.hospital_id:
        target_hospital_id = user.recipient_profile.hospital_id

    try:
        new_payment = Payment(
            user_id=user_id,
            hospital_id=target_hospital_id,
            amount=amount,
            transaction_id=txn_id,
            purpose=purpose,
            status='Successful'
        )
        
        # LOGIC 1: Hospital Registration
        if purpose == 'Hospital Registration Fee' and user.hospital_profile:
            user.hospital_profile.is_paid = True
            
        # LOGIC 2: Medical Report Verification Fee (Donor/Recipient)
        elif purpose == 'Clinical Report Verification Fee':
            if user.donor_profile:
                user.donor_profile.is_paid = True
            if user.recipient_profile:
                user.recipient_profile.is_paid = True

        # LOGIC 3: Organ Transport & Preservation Fee
        elif purpose == 'Organ Transport & Preservation Fee' and match_id:
            match = MatchRequest.query.get(match_id)
            if match:
                match.is_transport_paid = True

        db.session.add(new_payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment successful!',
            'transaction_id': txn_id,
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    user_id = get_jwt_identity()
    payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
    return jsonify([p.to_dict() for p in payments]), 200
