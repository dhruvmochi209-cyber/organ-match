from utils.db import db
from datetime import datetime

class Donor(db.Model):
    __tablename__ = 'donors'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    blood_type = db.Column(db.String(5), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    organ_to_donate = db.Column(db.String(50), nullable=False)
    medical_history = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=True)
    verification_status = db.Column(db.Enum('Pending', 'Verified', 'Rejected', name='donor_verification_status'), default='Pending')
    is_paid = db.Column(db.Boolean, default=False)
    hla_a = db.Column(db.String(50), nullable=True)
    hla_b = db.Column(db.String(50), nullable=True)
    hla_dr = db.Column(db.String(50), nullable=True)
    govt_id = db.Column(db.String(50), nullable=True) # Aadhaar/Voter ID
    weight = db.Column(db.Float, nullable=True) # Anatomical match factor (kg)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('donor_profile', uselist=False, cascade="all, delete-orphan"))
    hospital = db.relationship('Hospital', backref='donors')
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
            'organ_to_donate': self.organ_to_donate,
            'location': self.location,
            'hospital_id': self.hospital_id,
            'verification_status': self.verification_status,
            'is_paid': self.is_paid,
            'created_at': self.created_at.isoformat()
        }
