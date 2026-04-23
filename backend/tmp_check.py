from app import create_app
from models import User, Recipient, Report
app = create_app()
with app.app_context():
    r = Recipient.query.join(User).filter(User.username == 'ronaldo').first()
    if r:
        print(f"Ronaldo BloodType=({r.blood_type})")
    else:
        print("Ronaldo not found")
