import os
import psycopg2

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQL_FILE = os.path.join(BACKEND_DIR, "scripts", "enable_rls.sql")

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:3kU9JGriasO36Uhl@db.xgddzjmnonafijgxmefz.supabase.co:5432/postgres"
)

def run():
    print("Connecting to Supabase to enable RLS on all 6 tables...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql = f.read()
        
    cur.execute(sql)
    conn.commit()
    print("[SUCCESS] RLS enabled and all 6 security policies created successfully!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    run()
