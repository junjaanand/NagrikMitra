import os
import sys
import time
import asyncio
import psycopg2
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Ensure UTF-8 output on Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

from fastapi.testclient import TestClient
from app.main import app
from app.database.db import get_db
from app.models.user import UserProfileInput
from app.services.rule_engine import match_eligible_schemes
from scripts.audit_scheme_lifecycle import check_scheme_url, SOFT_DEAD_PATTERNS
import httpx

client = TestClient(app)

async def test_streamed_probe_and_soft_dead():
    print("\n[CHECK 1] Testing Streamed GET & Soft-Dead Detection...")
    
    # 1. Probe a live known national portal
    sem = asyncio.Semaphore(5)
    async with httpx.AsyncClient(verify=False, follow_redirects=True) as http_c:
        res = await check_scheme_url(http_c, sem, {
            "slug": "test-live-portal",
            "apply_url": "https://india.gov.in"
        })
    print(f"  - Probed https://india.gov.in -> Status: {res['status']}, Code: {res.get('code')}")
    assert res["status"] in ("active", "redirected"), f"Unexpected status: {res['status']}"
    print("  --> PASS: Streamed GET probe succeeded without 405/403 firewall rejection!")

    # 2. Test Soft-Dead pattern recognition
    sample_html = """
    <html>
      <head><title>Runtime Error</title></head>
      <body>
        <h1>Server Error in '/' Application</h1>
        <p>An unhandled exception occurred during execution.</p>
      </body>
    </html>
    """
    found_pattern = None
    for p in SOFT_DEAD_PATTERNS:
        if p in sample_html.lower():
            found_pattern = p
            break
    print(f"  - Testing Soft-Dead buffer matching -> Matched pattern: '{found_pattern}'")
    assert found_pattern == "server error in '/' application"
    print("  --> PASS: Soft-200 ASP.NET crash pattern successfully detected!")

def test_database_umbrella_mergers():
    print("\n[CHECK 2] Testing Umbrella Scheme Mergers in PostgreSQL 17...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # 1. Indira Awas Yojana -> PMAY-G
    cur.execute("""
        SELECT slug, name, lifecycle_status, successor_slug, successor_name, merger_notice 
        FROM schemes 
        WHERE slug = 'indira-awas-yojana';
    """)
    iay = cur.fetchone()
    assert iay is not None, "indira-awas-yojana not found in database!"
    print(f"  - Legacy: {iay[1]}")
    print(f"    * Lifecycle Status: {iay[2]}")
    print(f"    * Successor Slug: {iay[3]}")
    print(f"    * Successor Name: {iay[4]}")
    assert iay[2] == "subsumed", f"Expected 'subsumed', got {iay[2]}"
    assert iay[3] == "pmay-g", f"Expected 'pmay-g', got {iay[3]}"
    assert "PMAY-G" in iay[4]

    # 2. Nirmal Bharat Abhiyan -> SBM-G
    cur.execute("""
        SELECT slug, name, lifecycle_status, successor_slug, successor_name 
        FROM schemes 
        WHERE slug = 'nirmal-bharat-abhiyan';
    """)
    nba = cur.fetchone()
    assert nba is not None
    print(f"  - Legacy: {nba[1]}")
    print(f"    * Successor Slug: {nba[3]}")
    print(f"    * Successor Name: {nba[4]}")
    assert nba[2] == "subsumed"
    assert nba[3] == "sbm-g-i"

    cur.close()
    conn.close()
    print("  --> PASS: Database contains verified umbrella merger relationships!")

def test_schemes_api_endpoints():
    print("\n[CHECK 3] Testing Backend API Endpoints for Successor Bridge...")
    
    # 1. Scheme detail endpoint
    r = client.get("/api/schemes/indira-awas-yojana")
    assert r.status_code == 200, f"Failed GET /api/schemes/indira-awas-yojana: {r.status_code}"
    data = r.json()
    print(f"  - GET /api/schemes/indira-awas-yojana:")
    print(f"    * name: {data['name']}")
    print(f"    * lifecycle_status: {data['lifecycle_status']}")
    print(f"    * successor_slug: {data['successor_slug']}")
    print(f"    * successor_name: {data['successor_name']}")
    print(f"    * merger_notice: {data['merger_notice'][:60]}...")
    assert data["lifecycle_status"] == "subsumed"
    assert data["successor_slug"] == "pmay-g"
    assert data["successor_name"] is not None

    # 2. Scheme list endpoint with search
    r_list = client.get("/api/schemes?search=Indira+Awas&page_size=5")
    assert r_list.status_code == 200
    list_data = r_list.json()
    matching_item = next((item for item in list_data["items"] if item["slug"] == "indira-awas-yojana"), None)
    assert matching_item is not None
    print(f"  - GET /api/schemes?search=Indira+Awas -> Found item with successor: {matching_item.get('successor_name')}")
    assert matching_item.get("successor_slug") == "pmay-g"
    print("  --> PASS: Schemes API returns successor metadata in lists and detail views!")

def test_rule_engine_filtering():
    print("\n[CHECK 4] Testing Rule Engine Candidate Filtering for Discontinued Schemes...")
    
    # Profile for a general farmer
    p = UserProfileInput(
        age=32,
        gender="male",
        state="Central",
        caste_category="General",
        annual_income=120000,
        residence="rural",
        is_bpl=False,
        has_disability=False,
        occupation="farmer"
    )
    res = match_eligible_schemes(p, limit=50)
    for s in res.matched_schemes:
        assert s.lifecycle_status not in ("discontinued", "dead_link"), f"Discontinued scheme recommended: {s.name}"
    print(f"  - Matched {res.total_matched} schemes. Zero discontinued or dead schemes recommended.")
    print("  --> PASS: Rule engine candidate query strictly protects citizens from dead/discontinued schemes!")

def verify_all():
    print("=" * 75)
    print("  NAGRIKMITRA PHASE 5 COMPREHENSIVE VERIFICATION: DATA FRESHNESS & MERGERS")
    print("=" * 75)

    asyncio.run(test_streamed_probe_and_soft_dead())
    test_database_umbrella_mergers()
    test_schemes_api_endpoints()
    test_rule_engine_filtering()

    print("\n" + "=" * 75)
    print("  ALL PHASE 5 (DATA FRESHNESS, LIFECYCLE AUDITOR & MERGERS) VERIFICATIONS PASSED 100%!")
    print("=" * 75)

if __name__ == "__main__":
    verify_all()
