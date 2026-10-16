import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_scheme_comparison_retrieval():
    """Verify Day 10 multi-scheme side-by-side comparison data retrieval."""
    # 1. Fetch top schemes
    list_res = client.get("/api/schemes?page=1&page_size=4")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) >= 2
    
    slugs = [item["slug"] for item in items[:3]]
    
    # 2. Fetch each scheme by slug and verify full attributes for matrix
    comparison_data = []
    for slug in slugs:
        res = client.get(f"/api/schemes/{slug}")
        assert res.status_code == 200, f"Failed to retrieve scheme slug: {slug}"
        detail = res.json()
        assert "name" in detail
        assert "category" in detail
        assert "state" in detail
        comparison_data.append(detail)
    
    assert len(comparison_data) >= 2
    print(f"\n Retrieved {len(comparison_data)} schemes for side-by-side comparison matrix.")
    print(" test_scheme_comparison_retrieval PASSED!")

def test_document_tokenization_and_readiness():
    """Verify document required string parsing and readiness scoring logic."""
    raw_docs = "Aadhaar Card, Bank Account Passbook, Domicile Certificate, Annual Income Certificate"
    tokens = [d.strip() for d in raw_docs.split(",") if len(d.strip()) > 3]
    
    assert len(tokens) == 4
    assert "Aadhaar Card" in tokens
    assert "Domicile Certificate" in tokens
    
    # Simulate citizen having 3 of 4 documents
    checked = {"Aadhaar Card": True, "Bank Account Passbook": True, "Domicile Certificate": True}
    ready_count = sum(1 for d in tokens if checked.get(d))
    readiness_pct = round((ready_count / len(tokens)) * 100)
    
    assert readiness_pct == 75, f"Expected 75% readiness, got {readiness_pct}%"
    print(f" Readiness index verified: {readiness_pct}% with missing: {[d for d in tokens if not checked.get(d)]}")
    print(" test_document_tokenization_and_readiness PASSED!")

if __name__ == "__main__":
    test_scheme_comparison_retrieval()
    test_document_tokenization_and_readiness()
