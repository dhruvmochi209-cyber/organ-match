from app import create_app
from utils.db import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Applying schema updates (v2)...")
    
    # List of columns to add
    updates = [
        ("match_requests", "is_transport_paid"),
        ("donors", "is_paid"),
        ("recipients", "is_paid")
    ]
    
    for table, col in updates:
        try:
            with db.engine.connect() as conn:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} BOOLEAN DEFAULT 0"))
                conn.commit()
                print(f"Added '{col}' to '{table}'.")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print(f"'{col}' in '{table}' already exists.")
            else:
                print(f"Error updating {table}.{col}: {e}")

    print("Database updates (v2) complete.")
