import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Donor, Hospital, User
from utils.db import db
from utils.helpers import log_audit
from utils.file_upload import upload_file
from models.report import Report
from utils.pdf_validator import validate_medical_pdf
donor_bp = Blueprint('donor', __name__)

def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get_or_404(user_id)

@donor_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_current_user()
    donor = Donor.query.filter_by(user_id=user.id).first()
    if not donor:
        return jsonify(None), 200
    return jsonify(donor.to_dict()), 200

@donor_bp.route('/register', methods=['POST'])
@jwt_required()
def register_donor():
    user = get_current_user()
    if user.role != 'donor':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    required = ['full_name', 'blood_type', 'age', 'organ_to_donate', 'location']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if Donor.query.filter_by(user_id=user.id).first():
        return jsonify({'error': 'Donor profile already exists'}), 409

    # --- MANDATORY REPORT CHECK ---
    existing_reports = Report.query.filter_by(user_id=user.id).all()
    if not existing_reports:
        return jsonify({'error': 'Process Blocked: You must upload a medical report before registration.'}), 400

    # 🧹 ROBUST FAIL-SAFE: Clear any stale reports left behind by previous users of this ID. 
    # We only keep the very latest report uploaded during THIS registration session.
    all_reports = Report.query.filter_by(user_id=user.id).order_by(Report.id.desc()).all()
    if len(all_reports) > 1:
        keep_id = all_reports[0].id
        Report.query.filter(Report.user_id == user.id, Report.id != keep_id).delete()
        db.session.commit()

    donor = Donor(
        user_id=user.id,
        full_name=data.get('full_name'),
        blood_type=data.get('blood_type'),
        age=data.get('age'),
        organ_to_donate=data.get('organ_to_donate'),
        hla_a=data.get('hla_a'),
        hla_b=data.get('hla_b'),
        hla_dr=data.get('hla_dr'),
        govt_id=data.get('govt_id'),
        weight=data.get('weight'),
        medical_history=data.get('medical_history', ''),
        location=data.get('location'),
        hospital_id=data.get('hospital_id')
    )
    db.session.add(donor)
    db.session.commit()
    log_audit(db, user.id, 'DONOR_REGISTERED', f"Donor profile created for {data['full_name']}")
    return jsonify({'message': 'Donor profile created', 'donor': donor.to_dict()}), 201

@donor_bp.route('/upload-report', methods=['POST'])
@jwt_required()
def upload_report():
    user = get_current_user()
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    organ = request.form.get('organ') # Get organ from frontend if available
    
    file_path = upload_file(file)
    if not file_path:
        return jsonify({'error': 'Invalid file type. Please upload a PDF.'}), 400

    # --- ADVANCED ORGAN-SPECIFIC VALIDATION ---
    absolute_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
    is_valid, msg = validate_medical_pdf(absolute_file_path, organ=organ)
    
    if not is_valid:
        if os.path.exists(absolute_file_path):
            os.remove(absolute_file_path)
        return jsonify({'error': msg}), 400

    report = Report(user_id=user.id, report_type='Medical', file_path=file_path, status='Pending') # Now set to Pending for hospital audit
    db.session.add(report)
    db.session.commit()
    log_audit(db, user.id, 'REPORT_UPLOADED', f"Medical report ({organ}) uploaded by donor {user.id}")
    return jsonify({'message': 'Report verified and uploaded successfully', 'report': report.to_dict()}), 201

@donor_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    user = get_current_user()
    reports = Report.query.filter_by(user_id=user.id).all()
    return jsonify([r.to_dict() for r in reports]), 200

@donor_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_donors():
    donors = Donor.query.all()
    return jsonify([d.to_dict() for d in donors]), 200
