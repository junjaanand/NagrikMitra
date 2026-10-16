import sys
import os
import io
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.dependencies.auth import _RATE_LIMIT_STORE

client = TestClient(app)

def test_unauthenticated_requests_blocked():
    """
    Day 12 Security Perimeter:
    Verifies that unauthenticated callers are rejected with HTTP 401 across all computational and admin endpoints.
    """
    # 1. Chat Message
    chat_res = client.post("/api/chat/message", json={"message": "Hello without token"})
    assert chat_res.status_code == 401, f"Expected 401 for unauthenticated chat, got {chat_res.status_code}"
    assert "Authentication required" in chat_res.json()["detail"]

    # 2. Document OCR
    ocr_res = client.post(
        "/api/ocr/scan-file",
        files={"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR..."), "image/png")}
    )
    assert ocr_res.status_code == 401, f"Expected 401 for unauthenticated OCR, got {ocr_res.status_code}"

    # 3. Dynamic Scheme Creation
    create_res = client.post("/api/schemes/create", json={"name": "Unauthenticated Scheme", "benefits": "None"})
    assert create_res.status_code == 401, f"Expected 401 for unauthenticated creation, got {create_res.status_code}"

    # 4. OGD Sync
    sync_res = client.post("/api/schemes/sync-ogd")
    assert sync_res.status_code == 401, f"Expected 401 for unauthenticated OGD sync, got {sync_res.status_code}"
    print("\n test_unauthenticated_requests_blocked PASSED!")

def test_authenticated_citizen_chat_and_ocr():
    """
    Day 12 Authenticated Citizen Access:
    Verifies that requests with valid citizen bearer tokens successfully execute.
    """
    citizen_headers = {"Authorization": "Bearer demo-session-farmer"}

    # 1. Chat Message
    chat_res = client.post(
        "/api/chat/message",
        headers=citizen_headers,
        json={"message": "What welfare schemes are available for farmers in UP?"}
    )
    assert chat_res.status_code == 200, f"Expected 200 for authenticated chat, got {chat_res.status_code}: {chat_res.text}"
    data = chat_res.json()
    assert "reply" in data
    assert data["provider"] in ["groq", "gemini", "local_grounded_fallback"]

    # 2. Camera frame OCR
    # Minimal 1x1 base64 GIF
    dummy_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    scan_res = client.post(
        "/api/ocr/scan-frame",
        headers=citizen_headers,
        json={"image_base64": dummy_b64}
    )
    assert scan_res.status_code == 200, f"Expected 200 for authenticated scan, got {scan_res.status_code}"
    print(" test_authenticated_citizen_chat_and_ocr PASSED!")

def test_rbac_scheme_ingestion_controls():
    """
    Day 12 Role-Based Access Control (RBAC):
    - Standard citizen token attempting scheme ingestion must be rejected with HTTP 403 Forbidden.
    - District CSC VLE / Admin token must succeed with HTTP 200.
    """
    citizen_headers = {"Authorization": "Bearer demo-session-farmer"}
    admin_headers = {"Authorization": "Bearer demo-session-vle"}

    scheme_payload = {
        "name": "PM RBAC Gated Test Scheme 2026",
        "ministry": "Ministry of Electronics and Information Technology",
        "department": "Digital India Division",
        "state": "Central",
        "category": "Science, IT & Communications",
        "beneficiary_type": "Citizens",
        "benefits": "Testing RBAC access control verification.",
        "estimated_benefit_amount": "₹10,000 Digital Voucher",
        "eligibility_text": "Citizens with valid digital ID.",
        "application_process": "Online application.",
        "documents_required": "Aadhaar Card",
        "apply_url": "https://meity.gov.in",
        "official_url": "https://meity.gov.in",
        "eligibility_age_min": 18,
        "eligibility_age_max": 75,
        "eligibility_gender": "all",
        "eligibility_income_max": None,
        "eligibility_residence": "both",
        "eligibility_state": '["All"]',
        "eligibility_disability": False,
        "eligibility_bpl": False
    }

    # 1. Citizen Role -> 403 Forbidden
    forbidden_res = client.post(
        "/api/schemes/create",
        headers=citizen_headers,
        json=scheme_payload
    )
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden for citizen role, got {forbidden_res.status_code}"
    assert "Access denied" in forbidden_res.json()["detail"]

    # 2. CSC VLE / Admin Role -> 200 OK
    authorized_res = client.post(
        "/api/schemes/create",
        headers=admin_headers,
        json=scheme_payload
    )
    assert authorized_res.status_code == 200, f"Expected 200 for admin role, got {authorized_res.status_code}: {authorized_res.text}"
    assert authorized_res.json()["name"] == scheme_payload["name"]

    # 3. OGD Sync with Admin Role -> 200 OK
    sync_res = client.post("/api/schemes/sync-ogd", headers=admin_headers)
    assert sync_res.status_code == 200
    print(" test_rbac_scheme_ingestion_controls PASSED!")

def test_compute_rate_limiting():
    """
    Day 12 Compute Quota Rate Limiter:
    Simulates burst requests on heavy compute endpoints and verifies HTTP 429 response.
    """
    burst_headers = {"Authorization": "Bearer demo-session-burst-user"}
    user_id = "demo-citizen-01"

    # Reset store for burst test
    _RATE_LIMIT_STORE.clear()

    # Make 30 valid requests
    responses = []
    for _ in range(30):
        res = client.post(
            "/api/chat/message",
            headers=burst_headers,
            json={"message": "ping"}
        )
        responses.append(res.status_code)

    assert all(code == 200 for code in responses), "Base requests failed before limit"

    # 31st request must trigger 429 Too Many Requests
    overlimit_res = client.post(
        "/api/chat/message",
        headers=burst_headers,
        json={"message": "ping exceeding limit"}
    )
    assert overlimit_res.status_code == 429, f"Expected 429 Too Many Requests, got {overlimit_res.status_code}"
    assert "Compute quota rate limit reached" in overlimit_res.json()["detail"]
    print(" test_compute_rate_limiting PASSED!")

    # Cleanup rate limit store
    _RATE_LIMIT_STORE.clear()

if __name__ == "__main__":
    print("\n--- Running Day 12 Strict Authentication & RBAC Test Suite ---")
    test_unauthenticated_requests_blocked()
    test_authenticated_citizen_chat_and_ocr()
    test_rbac_scheme_ingestion_controls()
    test_compute_rate_limiting()
    print("\n ALL DAY 12 TESTS PASSED SUCCESSFULLY!")
