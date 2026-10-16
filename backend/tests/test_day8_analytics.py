import sys
import os
import time
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_analytics_endpoint_status_and_schema():
    """Verify Day 8 analytics API returns complete structured distributions."""
    # Warm-up request
    _ = client.get("/api/schemes/meta/analytics")
    
    t0 = time.perf_counter()
    response = client.get("/api/schemes/meta/analytics")
    latency = (time.perf_counter() - t0) * 1000
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    
    # Verify core counts
    assert data["total_schemes"] >= 4693, f"Expected >= 4693, got {data['total_schemes']}"
    assert len(data["category_distribution"]) >= 8
    assert len(data["jurisdiction_distribution"]) == 10
    assert len(data["benefit_types"]) == 5
    assert len(data["financial_brackets"]) == 5
    
    # Check Central Flagship vs States
    assert data["target_demographics"]["central_flagship"] >= 684
    assert data["target_demographics"]["state_initiatives"] >= 4009
    assert data["target_demographics"]["women_targeted"] >= 448
    assert data["target_demographics"]["pwd_targeted"] >= 308
    
    print(f"\n Analytics Endpoint Latency (warmed): {latency:.2f} ms")
    assert latency < 1500, f"Latency benchmark exceeded: {latency:.2f} ms"
    print(" test_analytics_endpoint_status_and_schema PASSED!")

if __name__ == "__main__":
    test_analytics_endpoint_status_and_schema()
