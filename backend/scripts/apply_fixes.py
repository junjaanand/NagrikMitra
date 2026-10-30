import os
import psycopg2

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQL_FILE = os.path.join(BACKEND_DIR, "scripts", "fix_warnings.sql")

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:3kU9JGriasO36Uhl@db.xgddzjmnonafijgxmefz.supabase.co:5432/postgres"
)

def run():
    print("Connecting to Supabase to resolve Security Advisor warnings...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql = f.read()
        
    cur.execute(sql)
    conn.commit()
    print("[SUCCESS] Security Advisor warnings resolved successfully!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    run()
