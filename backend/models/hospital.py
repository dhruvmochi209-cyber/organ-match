from utils.db import db
from datetime import datetime

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    certification_status = db.Column(db.Enum('Pending', 'Certified', 'Rejected', name='hospital_certification'), default='Pending')
    is_paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('hospital_profile', uselist=False, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'location': self.location,
            'certification_status': self.certification_status,
            'is_paid': self.is_paid,
            'created_at': self.created_at.isoformat()
        }
