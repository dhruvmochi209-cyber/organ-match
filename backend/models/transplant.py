from utils.db import db
from datetime import datetime

class TransplantRecord(db.Model):
    __tablename__ = 'transplant_records'
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match_requests.id', ondelete="CASCADE"), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id', ondelete="CASCADE"), nullable=False)
    surgery_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum('Scheduled', 'In Progress', 'Success', 'Failed', name='transplant_status'), default='Scheduled')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    match = db.relationship('MatchRequest', backref=db.backref('transplant_record', uselist=False, cascade="all, delete-orphan", passive_deletes=True))
    hospital = db.relationship('Hospital', backref=db.backref('transplants', cascade="all, delete-orphan", passive_deletes=True))

    def to_dict(self):
        return {
            'id': self.id,
            'match_id': self.match_id,
            'hospital_id': self.hospital_id,
            'surgery_date': self.surgery_date.isoformat() if self.surgery_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
