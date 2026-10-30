import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

sql_file = os.path.join(os.path.dirname(__file__), "create_vector_rpc.sql")
with open(sql_file, "r", encoding="utf-8") as f:
    sql = f.read()

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute(sql)
conn.commit()
print("[SUCCESS] Applied vector schema and match_schemes_hybrid RPC to Supabase!")

cur.close()
conn.close()
