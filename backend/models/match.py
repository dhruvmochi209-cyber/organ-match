from utils.db import db
from datetime import datetime

class MatchRequest(db.Model):
    __tablename__ = 'match_requests'
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donors.id', ondelete="CASCADE"), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('recipients.id', ondelete="CASCADE"), nullable=False)
    match_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.Enum('Low', 'Medium', 'High', name='risk_levels'), nullable=False)
    status = db.Column(db.Enum('Pending', 'Hospital Approved', 'Rejected', 'In Progress', 'Completed', name='match_status'), default='Pending')
    is_transport_paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    donor = db.relationship('Donor', backref=db.backref('matches', cascade="all, delete-orphan", passive_deletes=True))
    recipient = db.relationship('Recipient', backref=db.backref('matches', cascade="all, delete-orphan", passive_deletes=True))

    def to_dict(self):
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'recipient_id': self.recipient_id,
            'donor_name': self.donor.full_name if self.donor else 'N/A',
            'donor_email': self.donor.user.email if (self.donor and self.donor.user) else 'N/A',
            'recipient_name': self.recipient.full_name if self.recipient else 'N/A',
            'recipient_email': self.recipient.user.email if (self.recipient and self.recipient.user) else 'N/A',
            'match_score': self.match_score,
            'risk_level': self.risk_level,
            'status': self.status,
            'is_transport_paid': self.is_transport_paid,
            'created_at': self.created_at.isoformat()
        }
