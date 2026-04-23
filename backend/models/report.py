from utils.db import db
from datetime import datetime

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    report_type = db.Column(db.Enum('Medical', 'Match', 'Verification', 'Transplant', name='report_types'), nullable=False)
    file_path = db.Column(db.String(255), nullable=True) # Used for uploaded PDFs/Images
    content = db.Column(db.Text, nullable=True) # Used for system generated text
    status = db.Column(db.Enum('Pending', 'Verified', 'Rejected', 'Generated', name='report_status'), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('reports', cascade="all, delete-orphan", passive_deletes=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_type': self.report_type,
            'file_path': self.file_path,
            'content': self.content,
            'status': self.status,
            'username': self.user.username if self.user else 'Unknown',
            'created_at': self.created_at.isoformat()
        }
