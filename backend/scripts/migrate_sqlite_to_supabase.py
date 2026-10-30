"""
NagrikMitra — SQLite to Supabase PostgreSQL 16 Batch Migration Engine
Reads 4,728 welfare schemes from local SQLite (nagrikmitra.db) and streams them
into Supabase PostgreSQL using high-throughput batched upserts.
"""

import os
import sys
import sqlite3
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("NagrikMitra.Migrate")

# Resolve SQLite database path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLITE_DB_PATH = os.path.join(BACKEND_DIR, "data", "nagrikmitra.db")
SCHEMA_SQL_PATH = os.path.join(BACKEND_DIR, "app", "database", "schema_supabase.sql")

def get_target_db_url() -> str:
    """Retrieves PostgreSQL connection string from environment or command line."""
    url = os.getenv("DATABASE_URL", "")
    if len(sys.argv) > 1 and sys.argv[1].startswith("postgres"):
        url = sys.argv[1]
    
    # Check .env if still empty
    if not url or "sqlite" in url:
        env_path = os.path.join(BACKEND_DIR, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("DATABASE_URL=") and "postgres" in line:
                        url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    return url

def run_migration():
    if not os.path.exists(SQLITE_DB_PATH):
        logger.error(f"Source SQLite database not found at: {SQLITE_DB_PATH}")
        sys.exit(1)

    target_url = get_target_db_url()
    if not target_url or "sqlite" in target_url:
        logger.error(
            "Target DATABASE_URL is not set to a valid PostgreSQL connection string.\n"
            "Please provide your Supabase URI in backend/.env or pass it as an argument:\n"
            "python migrate_sqlite_to_supabase.py 'postgresql://postgres.[project]:[password]@...:6543/postgres'"
        )
        sys.exit(1)

    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        logger.error("psycopg2 is not installed. Run: pip install psycopg2-binary")
        sys.exit(1)

    # 1. Connect to Source SQLite
    logger.info(f"Connecting to source SQLite database: {SQLITE_DB_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    sqlite_cur.execute("SELECT COUNT(*) FROM schemes;")
    total_schemes = sqlite_cur.fetchone()[0]
    logger.info(f"Found {total_schemes:,} schemes in SQLite database.")

    # 2. Connect to Target Supabase PostgreSQL
    logger.info("Connecting to Supabase PostgreSQL...")
    pg_conn = psycopg2.connect(target_url)
    pg_conn.autocommit = False
    pg_cur = pg_conn.cursor()

    # 3. Apply Schema DDL
    if os.path.exists(SCHEMA_SQL_PATH):
        logger.info(f"Applying master schema DDL from {SCHEMA_SQL_PATH}...")
        with open(SCHEMA_SQL_PATH, "r", encoding="utf-8") as f:
            ddl_sql = f.read()
        pg_cur.execute(ddl_sql)
        pg_conn.commit()
        logger.info("Supabase PostgreSQL schema tables and extensions initialized successfully.")

    # 4. Read all records from SQLite
    sqlite_cur.execute("""
        SELECT 
            slug, name, description, ministry, department, state, category,
            beneficiary_type, benefits, eligibility_text, application_process,
            documents_required, apply_url, official_url, eligibility_age_min,
            eligibility_age_max, eligibility_gender, eligibility_caste,
            eligibility_income_max, eligibility_residence, eligibility_state,
            eligibility_disability, eligibility_bpl, scraped_at
        FROM schemes;
    """)

    columns = [
        "slug", "name", "description", "ministry", "department", "state", "category",
        "beneficiary_type", "benefits", "eligibility_text", "application_process",
        "documents_required", "apply_url", "official_url", "eligibility_age_min",
        "eligibility_age_max", "eligibility_gender", "eligibility_caste",
        "eligibility_income_max", "eligibility_residence", "eligibility_state",
        "eligibility_disability", "eligibility_bpl", "scraped_at"
    ]

    col_names = ", ".join(columns)
    insert_sql = f"""
        INSERT INTO public.schemes ({col_names})
        VALUES %s
        ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            ministry = EXCLUDED.ministry,
            department = EXCLUDED.department,
            state = EXCLUDED.state,
            category = EXCLUDED.category,
            benefits = EXCLUDED.benefits,
            eligibility_text = EXCLUDED.eligibility_text,
            application_process = EXCLUDED.application_process,
            documents_required = EXCLUDED.documents_required,
            apply_url = EXCLUDED.apply_url,
            official_url = EXCLUDED.official_url,
            eligibility_age_min = EXCLUDED.eligibility_age_min,
            eligibility_age_max = EXCLUDED.eligibility_age_max,
            eligibility_gender = EXCLUDED.eligibility_gender,
            eligibility_caste = EXCLUDED.eligibility_caste,
            eligibility_income_max = EXCLUDED.eligibility_income_max,
            eligibility_residence = EXCLUDED.eligibility_residence,
            eligibility_state = EXCLUDED.eligibility_state,
            eligibility_disability = EXCLUDED.eligibility_disability,
            eligibility_bpl = EXCLUDED.eligibility_bpl;
    """

    # 5. Batch Stream Insert in chunks of 500
    BATCH_SIZE = 500
    batch = []
    migrated_count = 0

    logger.info(f"Beginning batch streaming migration (Batch size: {BATCH_SIZE})...")

    while True:
        row = sqlite_cur.fetchone()
        if row is None:
            break

        row_dict = dict(row)
        # Normalize booleans
        row_dict["eligibility_disability"] = bool(row_dict.get("eligibility_disability"))
        row_dict["eligibility_bpl"] = bool(row_dict.get("eligibility_bpl"))

        values_tuple = tuple(row_dict[c] for c in columns)
        batch.append(values_tuple)

        if len(batch) >= BATCH_SIZE:
            execute_values(pg_cur, insert_sql, batch)
            pg_conn.commit()
            migrated_count += len(batch)
            logger.info(f"Migrated {migrated_count:,} / {total_schemes:,} schemes...")
            batch = []

    if batch:
        execute_values(pg_cur, insert_sql, batch)
        pg_conn.commit()
        migrated_count += len(batch)

    logger.info(f"[SUCCESS] Migration Complete! Successfully migrated {migrated_count:,} schemes to Supabase PostgreSQL.")

    # 6. Verify Generated Stored Columns
    pg_cur.execute("""
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN application_mode = 'online' THEN 1 END) as online_count,
            COUNT(CASE WHEN application_mode = 'offline' THEN 1 END) as offline_count,
            COUNT(CASE WHEN lifecycle_status = 'active' THEN 1 END) as active_count
        FROM public.schemes;
    """)
    stats = pg_cur.fetchone()
    logger.info(
        f"[STATS] Supabase Catalog Verification: Total={stats[0]:,}, "
        f"Online Modes={stats[1]:,}, Offline Modes={stats[2]:,}, Active Schemes={stats[3]:,}"
    )

    pg_cur.close()
    pg_conn.close()
    sqlite_conn.close()

if __name__ == "__main__":
    run_migration()
