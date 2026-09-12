import sys
import os
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.db import get_db, init_db
from app.database.vector_store import (
    get_or_create_schemes_collection,
    add_schemes_to_vector_store,
    query_similar_schemes
)
from fastapi.testclient import TestClient
from app.main import app

def test_sqlite_database():
    print("\n--- Testing SQLite Database ---")
    init_db()
    with get_db() as conn:
        c = conn.cursor()
        
        # 1. Total Schemes Count
        c.execute("SELECT COUNT(*) FROM schemes")
        count = c.fetchone()[0]
        print(f"Total schemes in DB: {count}")
        assert count == 4693, f"Expected 4693 schemes, got {count}"
        
        # 2. Query Latency Benchmark
        t0 = time.perf_counter()
        c.execute("SELECT slug, name, state, category FROM schemes WHERE state = 'Central' LIMIT 20")
        rows = c.fetchall()
        latency_ms = (time.perf_counter() - t0) * 1000
        print(f"Indexed query for 20 Central schemes: {len(rows)} rows in {latency_ms:.2f} ms")
        assert latency_ms < 20, f"Query latency too high: {latency_ms:.2f} ms"
        
        # 3. State & Category distribution
        c.execute("SELECT COUNT(DISTINCT state) FROM schemes")
        states_count = c.fetchone()[0]
        c.execute("SELECT COUNT(DISTINCT category) FROM schemes")
        cats_count = c.fetchone()[0]
        print(f"Coverage: {states_count} States/UTs, {cats_count} Categories")
        assert states_count >= 30, "Expected at least 30 states"

    print(" SQLite Database verification PASSED!")

def test_chroma_vector_store():
    print("\n--- Testing ChromaDB Vector Store ---")
    col = get_or_create_schemes_collection("nagrikmitra_schemes")
    print(f"ChromaDB collection initialized: {col.name}")
    
    # Load 5 sample schemes from SQLite to populate initial vector store
    with get_db() as conn:
        conn.row_factory = None
        c = conn.cursor()
        c.execute("SELECT slug, name, state, category, benefits, eligibility_text, documents_required FROM schemes LIMIT 5")
        sample_rows = c.fetchall()
        
    sample_schemes = []
    for r in sample_rows:
        sample_schemes.append({
            "slug": r[0],
            "name": r[1],
            "state": r[2],
            "category": r[3],
            "benefits": r[4],
            "eligibility_text": r[5],
            "documents_required": r[6]
        })
        
    added = add_schemes_to_vector_store(sample_schemes)
    print(f"Added {added} sample schemes to ChromaDB collection")
    
    # Query vector store
    t0 = time.perf_counter()
    res = query_similar_schemes("scholarship student financial assistance", n_results=1)
    latency_ms = (time.perf_counter() - t0) * 1000
    print(f"Vector search completed in {latency_ms:.2f} ms")
    assert len(res["ids"][0]) > 0, "Vector query returned no results"
    print(" ChromaDB Vector Store verification PASSED!")

def test_fastapi_endpoints():
    print("\n--- Testing FastAPI API Endpoints ---")
    client = TestClient(app)
    
    # 1. Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.status_code}"
    print(f"GET / -> {r.json()}")
    
    # 2. Health
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
    print(f"GET /health -> {r.json()}")
    
    # 3. Modular routers
    for endpoint, tag in [
        ("/api/schemes/", "Schemes"),
        ("/api/eligibility/", "Eligibility"),
        ("/api/chat/", "Chat"),
        ("/api/ocr/", "OCR")
    ]:
        r = client.get(endpoint)
        assert r.status_code == 200, f"{tag} route failed: {r.status_code}"
        print(f"GET {endpoint} -> Status 200 OK")

    print(" FastAPI Endpoints verification PASSED!")

if __name__ == "__main__":
    print("========================================")
    print(" NAGRIKMITRA DAY 1 VERIFICATION SUITE   ")
    print("========================================")
    test_sqlite_database()
    test_chroma_vector_store()
    test_fastapi_endpoints()
    print("\n========================================")
    print(" ALL DAY 1 TASKS COMPLETED & VERIFIED! ")
    print("========================================")
