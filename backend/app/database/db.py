import sqlite3
from contextlib import contextmanager
import os
from app.config import settings

DB_PATH = settings.DATABASE_URL.replace("sqlite:///", "")
# ensure absolute path if needed, but relative to backend dir based on task description: d:\2hrs\backend\data\nagrikmitra.db
if DB_PATH.startswith("./"):
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), DB_PATH[2:])

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS schemes (
            slug TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            ministry TEXT,
            department TEXT,
            state TEXT,
            category TEXT,
            beneficiary_type TEXT,
            benefits TEXT,
            eligibility_text TEXT,
            application_process TEXT,
            documents_required TEXT,
            apply_url TEXT,
            official_url TEXT,
            eligibility_age_min INTEGER,
            eligibility_age_max INTEGER,
            eligibility_gender TEXT,
            eligibility_caste TEXT,
            eligibility_income_max INTEGER,
            eligibility_residence TEXT,
            eligibility_state TEXT,
            eligibility_disability BOOLEAN,
            eligibility_bpl BOOLEAN,
            scraped_at TEXT
        )
        ''')
        
        # Create indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_state ON schemes(state);",
            "CREATE INDEX IF NOT EXISTS idx_category ON schemes(category);",
            "CREATE INDEX IF NOT EXISTS idx_eligibility_gender ON schemes(eligibility_gender);",
            "CREATE INDEX IF NOT EXISTS idx_eligibility_bpl ON schemes(eligibility_bpl);",
            "CREATE INDEX IF NOT EXISTS idx_eligibility_disability ON schemes(eligibility_disability);",
            "CREATE INDEX IF NOT EXISTS idx_eligibility_residence ON schemes(eligibility_residence);"
        ]
        
        for idx in indexes:
            cursor.execute(idx)
            
        conn.commit()
