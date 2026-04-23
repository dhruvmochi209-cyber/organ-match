from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Donor, Recipient, Hospital, MatchRequest
from models.report import Report
from models.approval import Approval
from models.transplant import TransplantRecord
from models.audit_log import AuditLog
from utils.db import db
from utils.helpers import log_audit
import os

report_bp = Blueprint('report', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get_or_404(user_id)

@report_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_reports():
    user = get_current_user()
    if user.role not in ['hospital_admin', 'government_admin', 'super_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    reports = Report.query.all()
    return jsonify([r.to_dict() for r in reports]), 200

@report_bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    user = get_current_user()
    reports = Report.query.filter_by(user_id=user.id).all()
    return jsonify([r.to_dict() for r in reports]), 200

@report_bp.route('/match-report/<int:match_id>', methods=['GET'])
@jwt_required()
def get_match_report(match_id):
    match = MatchRequest.query.get_or_404(match_id)
    donor = Donor.query.get(match.donor_id)
    recipient = Recipient.query.get(match.recipient_id)
    approval = Approval.query.filter_by(match_id=match_id).first()
    transplant = TransplantRecord.query.filter_by(match_id=match_id).first()

    from services.matching_service import generate_compatibility_explanation
    report = {
        'match_id': match.id,
        'status': match.status,
        'match_score': match.match_score,
        'risk_level': match.risk_level,
        'created_at': match.created_at.isoformat(),
        'donor': {
            'name': donor.full_name, 'blood_type': donor.blood_type,
            'age': donor.age, 'organ': donor.organ_to_donate, 'location': donor.location
        } if donor else {},
        'recipient': {
            'name': recipient.full_name, 'blood_type': recipient.blood_type,
            'age': recipient.age, 'organ_needed': recipient.organ_needed,
            'urgency': recipient.urgency, 'location': recipient.location
        } if recipient else {},
        'compatibility_explanation': generate_compatibility_explanation(donor, recipient, match.match_score) if donor and recipient else '',
        'hospital_decision': approval.hospital_decision if approval else 'N/A',
        'hospital_reason': approval.hospital_reason if approval else '',
        'government_decision': approval.government_decision if approval else 'N/A',
        'government_reason': approval.government_reason if approval else '',
        'transplant': transplant.to_dict() if transplant else None
    }
    return jsonify(report), 200

@report_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    user = get_current_user()
    if user.role != 'super_admin':
        return jsonify({'error': 'Unauthorized'}), 403
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
    result = []
    for log in logs:
        d = log.to_dict()
        u = User.query.get(log.user_id) if log.user_id else None
        d['username'] = u.username if u else 'System'
        result.append(d)
    return jsonify(result), 200

@report_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_report(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    directory = os.path.dirname(os.path.join(upload_folder, filename))
    file_name = os.path.basename(filename)
    return send_from_directory(directory, file_name)
