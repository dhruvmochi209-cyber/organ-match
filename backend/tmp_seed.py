import os
import sys

# Add the backend directory to the path so we can import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from utils.db import db
from models import User

def seed_data():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()

        # Check if users already exist
        if User.query.filter_by(email='admin@organmatch.com').first():
            print("Admin user already exists.")
        else:
            # Create Super Admin
            admin = User(username='admin', email='admin@organmatch.com', role='super_admin')
            admin.set_password('admin123')
            db.session.add(admin)
            print("Super Admin created: admin@organmatch.com / admin123")

        if User.query.filter_by(email='hospital@organmatch.com').first():
            print("Hospital user already exists.")
        else:
            # Create Hospital Admin
            hospital = User(username='hospital', email='hospital@organmatch.com', role='hospital_admin')
            hospital.set_password('hospital123')
            db.session.add(hospital)
            print("Hospital Admin created: hospital@organmatch.com / hospital123")

        db.session.commit()
        print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
