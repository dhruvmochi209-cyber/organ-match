from utils.db import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    transaction_id = db.Column(db.String(100), unique=True, nullable=False)
    purpose = db.Column(db.String(100), nullable=False) # e.g., 'Hospital Registration Fee'
    status = db.Column(db.String(20), default='Successful')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('payments', cascade="all, delete-orphan"))
    hospital = db.relationship('Hospital', backref='payments')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'hospital_id': self.hospital_id,
            'amount': self.amount,
            'transaction_id': self.transaction_id,
            'purpose': self.purpose,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
