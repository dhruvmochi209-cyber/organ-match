import os
from app import create_app
from utils.db import db
from models import User, Donor, Recipient, Hospital, Payment

def fix_payments():
    print("🚀 Syncing historical payments with Hospital nodes...")
    app = create_app()
    with app.app_context():
        payments = Payment.query.filter_by(hospital_id=None).all()
        fixed_count = 0
        
        for p in payments:
            user = User.query.get(p.user_id)
            if not user: continue
            
            target_id = None
            if user.hospital_profile:
                target_id = user.hospital_profile.id
            elif user.donor_profile and user.donor_profile.hospital_id:
                target_id = user.donor_profile.hospital_id
            elif user.recipient_profile and user.recipient_profile.hospital_id:
                target_id = user.recipient_profile.hospital_id
            
            if target_id:
                p.hospital_id = target_id
                fixed_count += 1
        
        db.session.commit()
        print(f"✅ Success! {fixed_count} payments linked to hospital nodes.")

if __name__ == "__main__":
    fix_payments()
