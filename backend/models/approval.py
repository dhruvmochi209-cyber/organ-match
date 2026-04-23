from utils.db import db
from datetime import datetime

class Approval(db.Model):
    __tablename__ = 'approvals'
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match_requests.id', ondelete="CASCADE"), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id', ondelete="CASCADE"), nullable=False)
    hospital_decision = db.Column(db.Enum('Pending', 'Approved', 'Rejected', name='h_decision_status'), default='Pending')
    hospital_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    match = db.relationship('MatchRequest', backref=db.backref('approvals', cascade="all, delete-orphan", passive_deletes=True))
    hospital = db.relationship('Hospital', backref=db.backref('approvals', cascade="all, delete-orphan", passive_deletes=True))

    def to_dict(self):
        return {
            'id': self.id,
            'match_id': self.match_id,
            'hospital_id': self.hospital_id,
            'hospital_decision': self.hospital_decision,
            'hospital_reason': self.hospital_reason,
            'created_at': self.created_at.isoformat()
        }
