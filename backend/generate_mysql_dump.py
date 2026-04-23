import os
import sqlite3

def generate_dump():
    print("🚀 Generating Full SQL Dump for MySQL Workbench...")
    
    sqlite_path = os.path.join(os.path.dirname(__file__), 'organmatch.db')
    dump_path = os.path.join(os.path.dirname(__file__), 'organmatch_full_database.sql')
    
    if not os.path.exists(sqlite_path):
        print("❌ SQLite database not found!")
        return

    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()

    # MySQL Header
    sql_script = [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "CREATE DATABASE IF NOT EXISTS organmatch_db;",
        "USE organmatch_db;",
        "\n"
    ]

    # Tables to export
    tables = [
        'users', 'hospitals', 'donors', 'recipients', 
        'match_requests', 'approvals', 'transplant_records', 
        'reports', 'audit_logs', 'payments'
    ]

    for table in tables:
        print(f"📦 Extracting table: {table}")
        sql_script.append(f"DROP TABLE IF EXISTS `{table}`;")
        
        # Get data
        cursor.execute(f"SELECT * FROM {table}")
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        if rows:
            # We add a small delay or use standard INSERT
            sql_script.append(f"INSERT INTO `{table}` ({', '.join(['`'+c+'`' for c in columns])}) VALUES")
            val_strings = []
            for row in rows:
                processed_row = []
                for val in row:
                    if val is None: processed_row.append("NULL")
                    elif isinstance(val, str): 
                        escaped = val.replace("'", "''")
                        processed_row.append(f"'{escaped}'")
                    elif isinstance(val, bool): processed_row.append("1" if val else "0")
                    else: processed_row.append(str(val))
                val_strings.append(f"({', '.join(processed_row)})")
            
            sql_script.append(",\n".join(val_strings) + ";")
        
        sql_script.append("\n")

    sql_script.append("SET FOREIGN_KEY_CHECKS = 1;")

    with open(dump_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_script))

    print(f"\n🎉 DONE! File generated: {dump_path}")
    print("AB IS FILE KO MYSQL WORKBENCH MEIN OPEN KAREIN AUR EXECUTE KAREIN.")

if __name__ == "__main__":
    generate_dump()
