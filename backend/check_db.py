from app import create_app
from utils.db import db
app = create_app()
from models import User, MatchRequest, TransplantRecord, Donor, Recipient
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    with open("results.txt", "w") as f:
        f.write("------ DATA CLEANUP ------\n")
        all_matches = MatchRequest.query.all()
        deleted_count = 0
        
        for m in all_matches:
            if not m.donor or not m.recipient:
                db.session.delete(m)
                deleted_count += 1
                f.write(f"Deleted Match #{m.id} due to missing donor or recipient\n")
        
        db.session.commit()
        f.write(f"\nCleanup complete. Deleted {deleted_count} orphaned match requests.\n")
