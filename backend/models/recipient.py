from utils.db import db
from datetime import datetime

class Recipient(db.Model):
    __tablename__ = 'recipients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    blood_type = db.Column(db.String(5), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    organ_needed = db.Column(db.String(50), nullable=False)
    urgency = db.Column(db.Integer, nullable=False) # 1 to 10 scale
    medical_history = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=True)
    verification_status = db.Column(db.Enum('Pending', 'Verified', 'Rejected', name='recipient_verification_status'), default='Pending')
    is_paid = db.Column(db.Boolean, default=False)
    hla_a = db.Column(db.String(50), nullable=True)
    hla_b = db.Column(db.String(50), nullable=True)
    hla_dr = db.Column(db.String(50), nullable=True)
    govt_id = db.Column(db.String(50), nullable=True) # Aadhaar/Voter ID
    weight = db.Column(db.Float, nullable=True) # For organ-size matching
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('recipient_profile', uselist=False, cascade="all, delete-orphan"))
    hospital = db.relationship('Hospital', backref='recipients')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'blood_type': self.blood_type,
            'hla_a': self.hla_a,
            'hla_b': self.hla_b,
            'hla_dr': self.hla_dr,
            'govt_id': self.govt_id,
            'weight': self.weight,
            'age': self.age,
            'organ_needed': self.organ_needed,
            'urgency': self.urgency,
            'location': self.location,
            'hospital_id': self.hospital_id,
            'verification_status': self.verification_status,
            'is_paid': self.is_paid,
            'registration_date': self.registration_date.isoformat()
        }
