import os
import sqlite3
import logging
from contextlib import contextmanager
from app.config import settings

logger = logging.getLogger("NagrikMitra.DB")

DATABASE_URL = getattr(settings, "DATABASE_URL", "sqlite:///./data/nagrikmitra.db")
IS_POSTGRES = DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")

# Global connection pool for PostgreSQL
_PG_POOL = None

if IS_POSTGRES:
    try:
        import psycopg2
        from psycopg2.pool import ThreadedConnectionPool
        from psycopg2.extras import DictCursor

        # Initialize threaded pool (min 1, max 20 connections)
        _PG_POOL = ThreadedConnectionPool(1, 20, DATABASE_URL)
        logger.info("Connected to Supabase PostgreSQL connection pool.")
    except Exception as e:
        logger.warning(f"Failed to initialize PostgreSQL pool ({e}). Falling back to local SQLite.")
        IS_POSTGRES = False

class PgCursorWrapper:
    """Translates SQLite '?' parameter placeholders to PostgreSQL '%s' seamlessly."""
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, params=None):
        if isinstance(query, bytes):
            query = query.decode("utf-8", errors="ignore")
        # In PostgreSQL, replace LIKE with case-insensitive ILIKE to match SQLite semantics
        pg_query = query.replace(" LIKE ", " ILIKE ").replace(" like ", " ilike ")
        if params is not None:
            # If query uses '?', escape existing '%' and convert '?' to '%s'
            if "?" in pg_query:
                pg_query = pg_query.replace("%", "%%").replace("?", "%s")
            return self._cursor.execute(pg_query, params)
        return self._cursor.execute(pg_query)

    def executemany(self, query, seq_of_parameters):
        if isinstance(query, bytes):
            query = query.decode("utf-8", errors="ignore")
        pg_query = query.replace(" LIKE ", " ILIKE ").replace(" like ", " ilike ")
        if "?" in pg_query:
            pg_query = pg_query.replace("%", "%%").replace("?", "%s")
        return self._cursor.executemany(pg_query, seq_of_parameters)

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    def fetchmany(self, size=None):
        return self._cursor.fetchmany(size) if size else self._cursor.fetchmany()

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def __iter__(self):
        return iter(self._cursor)

    def __getattr__(self, name):
        return getattr(self._cursor, name)

class PgConnectionWrapper:
    """Wraps psycopg2 connection to provide cursor with transparent '?' translation."""
    def __init__(self, conn, pool=None):
        self._conn = conn
        self._pool = pool
        self.row_factory = None

    def cursor(self):
        from psycopg2.extras import DictCursor
        return PgCursorWrapper(self._conn.cursor(cursor_factory=DictCursor))

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        if self._pool:
            self._pool.putconn(self._conn)
        else:
            self._conn.close()

# Safe fallback SQLite path for offline local development
DEFAULT_SQLITE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "nagrikmitra.db")
)

if DATABASE_URL.startswith("sqlite:///"):
    DB_PATH = DATABASE_URL.replace("sqlite:///", "")
    if DB_PATH.startswith("./"):
        DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), DB_PATH[2:])
else:
    DB_PATH = DEFAULT_SQLITE_PATH

@contextmanager
def get_db():
    """
    Unified database connection context manager:
    - Automatically routes to Supabase PostgreSQL when DATABASE_URL is configured.
    - Gracefully falls back to local SQLite with WAL mode for offline local development.
    """
    if IS_POSTGRES and _PG_POOL:
        conn = _PG_POOL.getconn()
        wrapped_conn = PgConnectionWrapper(conn, _PG_POOL)
        try:
            yield wrapped_conn
        finally:
            wrapped_conn.close()
    else:
        conn = sqlite3.connect(DB_PATH, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA busy_timeout = 5000;")
        try:
            from app.services.link_resolver import classify_application_mode, classify_lifecycle_status
            conn.create_function("classify_mode", 2, classify_application_mode)
            conn.create_function("classify_status", 3, classify_lifecycle_status)
        except Exception:
            pass
        try:
            yield conn
        finally:
            conn.close()

def init_db():
    """Initializes schema on startup based on the active backend."""
    if IS_POSTGRES:
        logger.info("Verifying Supabase PostgreSQL schema...")
        schema_file = os.path.join(os.path.dirname(__file__), "schema_supabase.sql")
        if os.path.exists(schema_file):
            try:
                with get_db() as conn:
                    with open(schema_file, "r", encoding="utf-8") as f:
                        ddl = f.read()
                    # Run DDL via raw cursor
                    cur = conn._conn.cursor() if hasattr(conn, "_conn") else conn.cursor()
                    cur.execute(ddl)
                    conn.commit()
                logger.info("Supabase PostgreSQL schema verified successfully.")
            except Exception as e:
                logger.warning(f"Notice during schema verification: {e}")
    else:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA journal_mode = WAL;")
            cursor.execute("PRAGMA synchronous = NORMAL;")
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
            logger.info("Local SQLite database initialized.")
