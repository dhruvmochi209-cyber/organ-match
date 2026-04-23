import os
from datetime import datetime

def log_audit(db, user_id, action, details=None, commit=True):
    """Helper to create an audit log entry."""
    from models.audit_log import AuditLog
    log = AuditLog(user_id=user_id, action=action, details=details)
    db.session.add(log)
    if commit:
        db.session.commit()

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_waiting_days(registration_date):
    """Calculate days waiting since registration."""
    delta = datetime.utcnow() - registration_date
    return delta.days
