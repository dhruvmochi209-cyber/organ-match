import pymysql
import os
from app import create_app
from utils.db import db
from sqlalchemy import create_engine, MetaData, Table, select, insert

def migrate():
    print("🚀 Starting Data Migration (Protocol Fix Mode)...")
    
    # 1. Connect to MySQL and ensure Database exists
    try:
        conn = pymysql.connect(
            host='127.0.0.1', 
            port=3306, 
            user='root', 
            password='',
            charset='utf8mb4'
        )
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS organmatch_db")
        conn.close()
        print("✅ MySQL Database 'organmatch_db' ready.")
    except Exception as e:
        print(f"❌ Error during initial MySQL connection: {e}")
        return

    # 2. Create Tables in MySQL
    app = create_app()
    with app.app_context():
        # Import models inside app context
        from models import User, Donor, Recipient, Hospital, MatchRequest, Approval, TransplantRecord, Report, AuditLog, Payment
        
        db.create_all()
        print("✅ MySQL Schema synchronized.")

        # 3. Engines
        sqlite_uri = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'organmatch.db')
        mysql_engine = db.engine 
        sqlite_engine = create_engine(sqlite_uri)
        
        source_meta = MetaData()
        source_meta.reflect(bind=sqlite_engine)
        
        # Consistent order for FKs
        ordered_tables = [
            'users', 'hospitals', 'donors', 'recipients', 
            'match_requests', 'approvals', 'transplant_records', 
            'reports', 'audit_logs', 'payments'
        ]
        
        with sqlite_engine.connect() as s_conn, mysql_engine.connect() as t_conn:
            for table_name in ordered_tables:
                if table_name not in source_meta.tables:
                    continue
                    
                print(f"📦 Syncing table: {table_name}...")
                source_table = source_meta.tables[table_name]
                
                rows = s_conn.execute(select(source_table)).mappings().all()
                if not rows:
                    print(f"   (Skiping empty table)")
                    continue
                
                try:
                    # Clear target if data exists to avoid duplication
                    t_conn.execute(source_table.delete())
                    
                    # Sync to MySQL
                    t_conn.execute(insert(source_table), rows)
                    print(f"   ✅ Done! {len(rows)} records synchronized.")
                except Exception as table_err:
                    print(f"   ❌ Error in table {table_name}: {table_err}")
                
            t_conn.commit()

    print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
    print("MySQL Workbench refresh karein. Ab aap MySQL ke saath 'python app.py' chala sakte hain.")

if __name__ == "__main__":
    migrate()
