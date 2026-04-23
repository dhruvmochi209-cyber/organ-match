from app import create_app
from utils.db import db
from models import Hospital, Payment
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Initializing database updates...")
    
    # 1. Create tables (handles Payment table)
    db.create_all()
    print("Tables verified/created.")
    
    # 2. Add 'is_paid' column to 'hospitals' table if it doesn't exist
    # SQLite doesn't support 'IF NOT EXISTS' for columns easily, so we check first
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE hospitals ADD COLUMN is_paid BOOLEAN DEFAULT 0"))
            conn.commit()
            print("Added 'is_paid' column to hospitals table.")
    except Exception as e:
        if "duplicate column name" in str(e).lower():
            print("'is_paid' column already exists.")
        else:
            print(f"Error adding column: {e}")

    print("Database updates complete.")
