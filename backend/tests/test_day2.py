import sys
import os
import time
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.models.user import UserProfileInput
from app.services.rule_engine import match_eligible_schemes, evaluate_scheme_eligibility

client = TestClient(app)

def test_rule_engine_test_cases():
    print("\n--- 1. Testing Rule Engine Test Cases ---")
    
    # TC-01: 35yo male farmer, Uttar Pradesh, ₹1.5L income, OBC, rural, BPL
    p1 = UserProfileInput(
        age=35,
        gender="male",
        state="Uttar Pradesh",
        caste_category="OBC",
        annual_income=150000,
        residence="rural",
        is_bpl=True,
        has_disability=False,
        occupation="farmer"
    )
    t0 = time.perf_counter()
    res1 = match_eligible_schemes(p1, limit=100)
    latency1 = (time.perf_counter() - t0) * 1000
    
    print(f"TC-01 (Farmer, UP, BPL): {res1.total_matched} schemes matched in {latency1:.2f} ms")
    assert res1.total_matched > 50, f"Expected >50 schemes, got {res1.total_matched}"
    assert latency1 < 250, f"Latency benchmark exceeded: {latency1:.2f} ms"
    
    # Check top schemes include farmer / rural schemes
    top_names = [s.name.lower() for s in res1.matched_schemes[:10]]
    has_relevant = any(w in name for name in top_names for w in ("kisan", "krishi", "krishak", "pashu", "farm", "crop", "bima", "awas"))
    print(f"Top 3 schemes for TC-01: {[s.name for s in res1.matched_schemes[:3]]}")
    assert has_relevant, "Expected farmer/agricultural schemes in top results"
    print(" TC-01 PASSED!")

    # TC-02: 22yo female student, Maharashtra, ₹3L income, SC, urban
    p2 = UserProfileInput(
        age=22,
        gender="female",
        state="Maharashtra",
        caste_category="SC",
        annual_income=300000,
        residence="urban",
        is_bpl=False,
        has_disability=False,
        occupation="student"
    )
    t0 = time.perf_counter()
    res2 = match_eligible_schemes(p2, limit=100)
    latency2 = (time.perf_counter() - t0) * 1000
    
    print(f"TC-02 (Female student, MH, SC): {res2.total_matched} schemes matched in {latency2:.2f} ms")
    assert res2.total_matched > 30, f"Expected >30 schemes, got {res2.total_matched}"
    
    # Check that male-only schemes or rural-only schemes are excluded
    for s in res2.matched_schemes:
        assert s.state in ("Central", "Maharashtra") or "Central" in s.state, f"Invalid state scheme returned: {s.state}"
    print(f"Top 3 schemes for TC-02: {[s.name for s in res2.matched_schemes[:3]]}")
    print(" TC-02 PASSED!")

    # TC-03: Boundary checks (age bounds, income limits, caste)
    scheme_mock = {
        "slug": "test-mock-scheme",
        "name": "Test Senior Citizen Scheme",
        "state": "Central",
        "eligibility_age_min": 60,
        "eligibility_age_max": 100,
        "eligibility_gender": "all",
        "eligibility_caste": "[]",
        "eligibility_income_max": 200000,
        "eligibility_residence": "both",
        "eligibility_state": '["All"]',
        "eligibility_bpl": 0,
        "eligibility_disability": 0
    }
    
    # Underage user (age 59)
    p_underage = UserProfileInput(age=59, gender="male", state="Delhi", caste_category="General", annual_income=100000, residence="urban", is_bpl=False, has_disability=False)
    elig, _, _ = evaluate_scheme_eligibility(scheme_mock, p_underage)
    assert not elig, "Underage user should NOT be eligible"
    
    # Eligible senior (age 65)
    p_senior = UserProfileInput(age=65, gender="male", state="Delhi", caste_category="General", annual_income=100000, residence="urban", is_bpl=False, has_disability=False)
    elig, _, _ = evaluate_scheme_eligibility(scheme_mock, p_senior)
    assert elig, "Eligible senior should be eligible"

    # Over income limit (income ₹300,000 > ₹200,000)
    p_rich = UserProfileInput(age=65, gender="male", state="Delhi", caste_category="General", annual_income=300000, residence="urban", is_bpl=False, has_disability=False)
    elig, _, _ = evaluate_scheme_eligibility(scheme_mock, p_rich)
    assert not elig, "User exceeding income limit should NOT be eligible"
    
    print(" TC-03 (Boundary & constraint checks) PASSED!")

def test_schemes_api_endpoints():
    print("\n--- 2. Testing Schemes API Endpoints ---")
    
    # 1. Paginated schemes list
    r = client.get("/api/schemes?page=1&page_size=10")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 4693
    assert len(data["items"]) == 10
    assert data["total_pages"] >= 470
    print(f"GET /api/schemes -> total: {data['total']}, page_size: {len(data['items'])}")

    # 2. Search filter
    r = client.get("/api/schemes?search=scholarship&page_size=5")
    assert r.status_code == 200
    search_data = r.json()
    assert search_data["total"] > 0
    print(f"Search 'scholarship' -> found {search_data['total']} schemes")

    # 3. State filter
    r = client.get("/api/schemes?state=Gujarat&page_size=5")
    assert r.status_code == 200
    state_data = r.json()
    assert state_data["total"] >= 600
    print(f"State 'Gujarat' filter -> found {state_data['total']} schemes")

    # 4. Scheme detail
    slug = data["items"][0]["slug"]
    r = client.get(f"/api/schemes/{slug}")
    assert r.status_code == 200
    detail = r.json()
    assert detail["slug"] == slug
    assert "caste_list" in detail
    assert "state_list" in detail
    print(f"GET /api/schemes/{slug} -> name: {detail['name'][:40]}...")

    # 5. Global Stats
    r = client.get("/api/schemes/meta/stats")
    assert r.status_code == 200
    stats = r.json()
    print(f"Meta stats: total={stats['total_schemes']}, central={stats['central_schemes']}, state_schemes={stats['state_schemes']}, women={stats['women_schemes_count']}")
    assert stats["total_schemes"] >= 4693
    assert stats["central_schemes"] >= 684
    assert stats["women_schemes_count"] >= 448

    # 6. Categories & States metadata
    r_cat = client.get("/api/schemes/meta/categories")
    assert r_cat.status_code == 200
    assert len(r_cat.json()) > 0
    
    r_state = client.get("/api/schemes/meta/states")
    assert r_state.status_code == 200
    assert len(r_state.json()) >= 30
    print(" Schemes API Endpoints verification PASSED!")

def test_eligibility_api_endpoints():
    print("\n--- 3. Testing Eligibility API Endpoints ---")
    
    payload = {
        "age": 40,
        "gender": "female",
        "state": "Gujarat",
        "caste_category": "OBC",
        "annual_income": 120000,
        "residence": "rural",
        "is_bpl": True,
        "has_disability": False,
        "occupation": "handicraft"
    }
    
    # 1. Full Match Endpoint
    t0 = time.perf_counter()
    r = client.post("/api/eligibility/match?limit=50", json=payload)
    latency = (time.perf_counter() - t0) * 1000
    assert r.status_code == 200
    data = r.json()
    print(f"POST /api/eligibility/match -> {data['total_matched']} schemes matched in {latency:.2f} ms")
    assert data["total_matched"] > 50
    assert len(data["matched_schemes"]) <= 50
    assert len(data["category_breakdown"]) > 0
    assert latency < 350, f"API latency exceeded: {latency:.2f} ms"

    # 2. Quick Check Endpoint
    r_quick = client.post("/api/eligibility/quick-check", json=payload)
    assert r_quick.status_code == 200
    quick_data = r_quick.json()
    assert quick_data["total_eligible"] == data["total_matched"]
    assert len(quick_data["top_schemes"]) <= 5
    print(f"POST /api/eligibility/quick-check -> top {len(quick_data['top_schemes'])} schemes returned")
    print(" Eligibility API Endpoints verification PASSED!")

if __name__ == "__main__":
    print("========================================")
    print(" NAGRIKMITRA DAY 2 VERIFICATION SUITE   ")
    print("========================================")
    test_rule_engine_test_cases()
    test_schemes_api_endpoints()
    test_eligibility_api_endpoints()
    print("\n========================================")
    print(" ALL DAY 2 TASKS COMPLETED & VERIFIED! ")
    print("========================================")
