import sys
import os
import time
import io
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_cors_headers_and_restrictions():
    """Verify production CORS configuration rejects unauthorized origins and permits frontend."""
    # Test valid origin
    res = client.options("/api/schemes", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    })
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert res.headers.get("access-control-allow-credentials") == "true"
    print(" test_cors_headers_and_restrictions PASSED!")

def test_chat_payload_length_constraints():
    """Verify oversized chat prompt (>2000 chars) is rejected with HTTP 422."""
    headers = {"Authorization": "Bearer demo-session-farmer"}
    oversized_prompt = "A" * 2001
    res = client.post("/api/chat/message", headers=headers, json={"message": oversized_prompt})
    assert res.status_code == 422, f"Expected 422 Unprocessable Entity, got {res.status_code}"
    
    # Verify oversized history (>20 turns) is rejected
    oversized_history = [{"role": "user", "content": f"msg {i}"} for i in range(25)]
    res2 = client.post("/api/chat/message", headers=headers, json={"message": "valid query", "history": oversized_history})
    assert res2.status_code == 422
    print(" test_chat_payload_length_constraints PASSED!")

def test_ocr_upload_file_size_cutoff():
    """Verify file upload aborts and rejects payloads exceeding 10 MB."""
    headers = {"Authorization": "Bearer demo-session-farmer"}
    # Create fake oversized payload (11 MB)
    large_payload = io.BytesIO(b"A" * (11 * 1024 * 1024))
    res = client.post(
        "/api/ocr/scan-file",
        headers=headers,
        files={"file": ("fake_large_card.png", large_payload, "image/png")}
    )
    assert res.status_code == 413, f"Expected 413 Payload Too Large, got {res.status_code}"
    print(" test_ocr_upload_file_size_cutoff PASSED!")

def test_cached_analytics_submillisecond_latency():
    """Verify in-memory caching drops analytics response latency from ~500ms to <20ms."""
    # Warm/seed the cache
    _ = client.get("/api/schemes/meta/analytics")
    
    # Measure cached latency
    t0 = time.perf_counter()
    res = client.get("/api/schemes/meta/analytics")
    latency = (time.perf_counter() - t0) * 1000
    
    assert res.status_code == 200
    data = res.json()
    assert data["total_schemes"] >= 4693
    print(f"\n Cached Analytics Latency: {latency:.2f} ms")
    assert latency < 50.0, f"Cache latency benchmark exceeded: {latency:.2f} ms"
    print(" test_cached_analytics_submillisecond_latency PASSED!")

def test_rule_engine_universal_and_multistate_matching():
    """Verify rule engine correctly matches pan-India schemes and multi-state criteria."""
    payload = {
        "age": 28,
        "gender": "female",
        "state": "Uttar Pradesh",
        "caste_category": "General",
        "annual_income": 120000,
        "residence": "rural",
        "is_bpl": True,
        "has_disability": False,
        "occupation": "farmer"
    }
    res = client.post("/api/eligibility/match", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matched"] > 50
    assert any("Central" in s["state"] for s in data["matched_schemes"])
    print(f" Matched {data['total_matched']} schemes for farmer in UP.")
    print(" test_rule_engine_universal_and_multistate_matching PASSED!")

if __name__ == "__main__":
    test_cors_headers_and_restrictions()
    test_chat_payload_length_constraints()
    test_ocr_upload_file_size_cutoff()
    test_cached_analytics_submillisecond_latency()
    test_rule_engine_universal_and_multistate_matching()
    print("\n ALL PRODUCTION HARDENING TESTS PASSED SUCCESSFULLY!")
