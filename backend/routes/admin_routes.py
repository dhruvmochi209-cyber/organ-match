from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Donor, Recipient, Hospital, MatchRequest
from models.audit_log import AuditLog
from models.transplant import TransplantRecord
from utils.db import db
from utils.helpers import log_audit

admin_bp = Blueprint('admin', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get_or_404(user_id)

def require_admin(user):
    if user.role != 'super_admin':
        return jsonify({'error': 'Unauthorized, super_admin only'}), 403
    return None

@admin_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user = get_current_user()
    if user.role != 'super_admin':
        return jsonify({'error': 'Unauthorized'}), 403

    stats = {
        'total_users': User.query.count(),
        'total_donors': Donor.query.count(),
        'total_recipients': Recipient.query.count(),
        'total_hospitals': Hospital.query.count(),
        'total_matches': MatchRequest.query.count(),
        'hospital_approved': MatchRequest.query.filter_by(status='Hospital Approved').count(),
        'completed': MatchRequest.query.filter_by(status='Completed').count(),
        'total_transplants': MatchRequest.query.filter_by(status='Completed').count(),
        'successful_transplants': MatchRequest.query.filter_by(status='Completed').count(),
    }
    return jsonify(stats), 200



@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user = get_current_user()
    err = require_admin(user)
    if err:
        return err
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = get_current_user()
    err = require_admin(user)
    if err:
        return err
    target = User.query.get_or_404(user_id)
    
    # 🧼 CLEANUP BEFORE DELETE: Ensure all associated data is wiped to prevent orphan "stale" records
    try:
        from models.report import Report
        from models.donor import Donor
        from models.recipient import Recipient
        from models.match import MatchRequest
        from models.audit_log import AuditLog
        
        # Explicit deletion of potentially orphaned data
        Report.query.filter_by(user_id=user_id).delete()
        Donor.query.filter_by(user_id=user_id).delete()
        Recipient.query.filter_by(user_id=user_id).delete()
        MatchRequest.query.filter((MatchRequest.donor_id == user_id) | (MatchRequest.recipient_id == user_id)).delete()
        AuditLog.query.filter_by(user_id=user_id).delete()
        
        db.session.delete(target)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e
    
    from utils.socketio import socketio
    socketio.emit('USER_UPDATED', {'action': 'deleted', 'user_id': user_id}, namespace='/')
    
    log_audit(db, user.id, 'USER_DELETED', f"User {user_id} deleted by admin {user.id}")
    return jsonify({'message': 'User deleted'}), 200

@admin_bp.route('/hospitals', methods=['GET'])
@jwt_required()
def get_hospitals():
    user = get_current_user()
    err = require_admin(user)
    if err: return err
    hospitals = Hospital.query.all()
    return jsonify([h.to_dict() for h in hospitals]), 200

@admin_bp.route('/approve-hospital/<int:hospital_id>', methods=['POST'])
@jwt_required()
def approve_hospital(hospital_id):
    user = get_current_user()
    err = require_admin(user)
    if err: return err
    data = request.get_json()
    hospital = Hospital.query.get_or_404(hospital_id)
    status = data.get('status')
    if status not in ['Certified', 'Rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    hospital.certification_status = status
    db.session.commit()
    log_audit(db, user.id, 'HOSPITAL_APPROVAL', f"Hospital {hospital_id} set to {status}")
    return jsonify({'message': f'Hospital {status}', 'hospital': hospital.to_dict()}), 200

@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    user = get_current_user()
    err = require_admin(user)
    if err:
        return err
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(200).all()
    result = []
    for log in logs:
        d = log.to_dict()
        u = User.query.get(log.user_id) if log.user_id else None
        d['username'] = u.username if u else 'System'
        d['email'] = u.email if u else ''
        result.append(d)
    return jsonify(result), 200

@admin_bp.route('/completed-transplants', methods=['GET'])
@jwt_required()
def get_completed_transplants():
    user = get_current_user()
    err = require_admin(user)
    if err: return err
    completed_matches = MatchRequest.query.filter_by(status='Completed').order_by(MatchRequest.created_at.desc()).all()
    return jsonify([m.to_dict() for m in completed_matches]), 200


