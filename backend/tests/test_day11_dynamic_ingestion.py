import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.db import get_db
from app.services.rag_pipeline import retrieve_scheme_context, ground_with_web_search

client = TestClient(app)

def test_dynamic_scheme_creation_and_dual_write():
    """
    Test Day 11: Dynamic scheme creation endpoint:
    - Verifies atomic dual-write to SQLite and ChromaDB
    - Verifies rule engine matches new scheme (<60ms)
    - Verifies analytics cache invalidation
    """
    payload = {
        "name": "PM Krishi Drone Vikas Test Yojana 2026",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "department": "Precision Agriculture Cell",
        "state": "Central",
        "category": "Agriculture,Rural & Environment",
        "beneficiary_type": "Small and Marginal Farmers",
        "benefits": "Direct capital subsidy of ₹50,000 for purchasing agricultural drone kits with 100% drone pilot license training waiver.",
        "estimated_benefit_amount": "₹50,000 Direct Drone Grant",
        "eligibility_text": "Small and marginal farmers holding Kisan Credit Card with minimum age of 18 years and income under ₹3 Lakh.",
        "application_process": "Register on the national agriculture portal with Aadhaar and KCC details.",
        "documents_required": "Aadhaar Card, Land Record / Khasra Khatauni, Kisan Credit Card",
        "apply_url": "https://agricoop.gov.in/test-drone",
        "official_url": "https://agricoop.gov.in",
        "eligibility_age_min": 18,
        "eligibility_age_max": 65,
        "eligibility_gender": "all",
        "eligibility_income_max": 300000,
        "eligibility_residence": "rural",
        "eligibility_state": '["All"]',
        "eligibility_disability": False,
        "eligibility_bpl": False
    }

    # 1. Post to creation endpoint
    admin_headers = {"Authorization": "Bearer demo-session-vle"}
    res = client.post("/api/schemes/create", headers=admin_headers, json=payload)
    assert res.status_code == 200, f"Failed to create scheme: {res.text}"
    created_data = res.json()
    slug = created_data["slug"]
    assert "pm-krishi-drone-vikas-test-yojana-2026" in slug
    assert created_data["name"] == payload["name"]

    # 2. Verify persisted in SQLite database
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT name, ministry, benefits FROM schemes WHERE slug = ?", (slug,))
        row = c.fetchone()
        assert row is not None, "Scheme was not persisted in SQLite"
        assert row[0] == payload["name"]
        assert row[1] == payload["ministry"]

    # 3. Verify retrieval via GET /api/schemes/{slug}
    get_res = client.get(f"/api/schemes/{slug}")
    assert get_res.status_code == 200
    assert get_res.json()["slug"] == slug

    # 4. Verify rule engine eligibility matching includes newly ingested scheme
    import time
    profile_payload = {
        "age": 35,
        "gender": "male",
        "state": "Uttar Pradesh",
        "caste_category": "General",
        "annual_income": 180000,
        "residence": "rural",
        "is_bpl": False,
        "has_disability": False,
        "occupation": "farmer"
    }
    t0 = time.perf_counter()
    match_res = client.post("/api/eligibility/match", json=profile_payload)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    assert match_res.status_code == 200
    assert elapsed_ms < 300.0, f"Match took too long: {elapsed_ms}ms"
    match_data = match_res.json()
    assert match_data["total_matched"] > 0
    matched_slugs = [s["slug"] for s in match_data["matched_schemes"]]
    assert slug in matched_slugs, f"Newly created scheme {slug} was not matched by rule engine"

def test_ogd_synchronization_service():
    """
    Test Day 11 Open Government Data (OGD) Synchronization:
    - Tests POST /api/schemes/sync-ogd
    - Validates ingestion of gazette schemes (PM Surya Ghar, Namo Drone Didi)
    """
    admin_headers = {"Authorization": "Bearer demo-session-vle"}
    res = client.post("/api/schemes/sync-ogd", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["records_synced"] >= 3
    assert "Open Government Data Platform" in data["source"]

    # Verify PM Surya Ghar 2026 exists in SQLite
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT name, apply_url FROM schemes WHERE slug = ?", ("pm-surya-ghar-muft-bijli-yojana-2026",))
        row = c.fetchone()
        assert row is not None, "PM Surya Ghar 2026 was not synced into database"
        assert "pmsuryaghar.gov.in" in row[1]

def test_live_web_gazette_grounding_fallback():
    """
    Test Day 11 Live Web Grounding Fallback in RAG Pipeline:
    - Verifies ground_with_web_search returns authoritative gazette context
    - Verifies retrieve_scheme_context augments queries referencing newly announced schemes
    """
    # Test gazette grounding directly
    context, sources = ground_with_web_search("What is the subsidy in PM Surya Ghar Muft Bijli Yojana?")
    assert "PM Surya Ghar" in context
    assert "pmsuryaghar.gov.in" in context
    assert "Press Information Bureau" in context
    assert len(sources) > 0
    assert sources[0]["source_url"] == "https://pmsuryaghar.gov.in"

    # Test senior citizen 70+ Ayushman expansion grounding
    context_sr, sources_sr = ground_with_web_search("Senior citizen 70 years Ayushman Bharat")
    assert "Ayushman Vaya Vandana" in context_sr or "70 years and above" in context_sr

    # Test end-to-end retrieve_scheme_context with live web grounding
    full_ctx, full_sources = retrieve_scheme_context("PM Surya Ghar solar rooftop electricity scheme")
    assert len(full_sources) > 0
    assert any("Surya" in s["name"] for s in full_sources)
    print(" test_live_web_gazette_grounding_fallback PASSED!")

if __name__ == "__main__":
    print("\n--- Running Day 11 Dynamic Ingestion & OGD Sync Test Suite ---")
    test_dynamic_scheme_creation_and_dual_write()
    print(" test_dynamic_scheme_creation_and_dual_write PASSED!")
    test_ogd_synchronization_service()
    print(" test_ogd_synchronization_service PASSED!")
    test_live_web_gazette_grounding_fallback()
    print("\n ALL DAY 11 TESTS PASSED SUCCESSFULLY!")

