import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

cur.execute("""
    SELECT slug, name, state, category 
    FROM schemes 
    WHERE slug ILIKE '%indira%' OR name ILIKE '%indira%' OR name ILIKE '%awas%'
    LIMIT 20;
""")
for r in cur.fetchall():
    print(f"{r[0]} | {r[1]} | {r[2]}")

cur.close()
conn.close()
