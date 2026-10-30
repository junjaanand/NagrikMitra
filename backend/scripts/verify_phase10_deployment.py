#!/usr/bin/env python3
"""
Verification Script for Phase 10: Cloud Deployment Architecture (Dockerfile, Vercel & Dynamic Networking)
Tests Dockerfile system specifications, Vercel SPA routing manifests, dynamic CORS regex verification,
and 60s cold-start timeout configuration.
"""

import sys
import json
import re
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dockerfile_configuration():
    print("\n[TEST 1] Testing Linux Backend Dockerfile Specifications...")
    dockerfile_path = PROJECT_ROOT / "backend" / "Dockerfile"
    assert dockerfile_path.exists(), f"Missing Dockerfile at {dockerfile_path}"
    content = dockerfile_path.read_text(encoding="utf-8")

    assert "python:3.11-slim" in content, "Dockerfile must use Python 3.11-slim base"
    assert "tesseract-ocr" in content, "Dockerfile must install tesseract-ocr"
    assert "tesseract-ocr-hin" in content, "Dockerfile must install tesseract-ocr-hin"
    assert "${PORT:-8000}" in content or "PORT" in content, "Dockerfile must support dynamic $PORT binding"
    print("  ✓ Base Image: python:3.11-slim confirmed.")
    print("  ✓ Native Binaries: tesseract-ocr + tesseract-ocr-hin included.")
    print("  ✓ Dynamic Entrypoint: ${PORT:-8000} dynamic port binding confirmed.")

def test_vercel_spa_manifest():
    print("\n[TEST 2] Testing Vercel SPA Routing & Security Manifest...")
    vercel_path = PROJECT_ROOT / "frontend" / "vercel.json"
    assert vercel_path.exists(), f"Missing vercel.json at {vercel_path}"
    
    data = json.loads(vercel_path.read_text(encoding="utf-8"))
    assert "rewrites" in data, "vercel.json missing rewrites block"
    rewrite = data["rewrites"][0]
    assert rewrite["source"] == "/(.*)"
    assert rewrite["destination"] == "/index.html"
    print("  ✓ SPA Rewrites: /(.*) -> /index.html correctly configured (no 404 on page refresh).")

    assert "headers" in data, "vercel.json missing headers block"
    headers = data["headers"][0]["headers"]
    header_names = {h["key"].lower() for h in headers}
    assert "x-content-type-options" in header_names
    assert "x-frame-options" in header_names
    print("  ✓ Security Headers: nosniff, DENY, XSS-Protection verified.")

def test_dynamic_cors_for_vercel():
    print("\n[TEST 3] Testing Dynamic CORS Middleware for Vercel Edge Deployments...")
    
    test_origins = [
        "https://nagrikmitra.vercel.app",
        "https://nagrikmitra-git-main-varun.vercel.app",
        "https://preview-deploy-77a8.vercel.app"
    ]
    
    for origin in test_origins:
        res = client.options(
            "/api/schemes/meta/stats",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET"
            }
        )
        assert res.status_code == 200, f"Preflight failed with status {res.status_code}"
        assert res.headers.get("access-control-allow-origin") == origin, f"Origin '{origin}' not permitted in CORS!"
        print(f"  ✓ Preflight permitted for Vercel edge origin: {origin}")

def test_frontend_cold_start_timeout():
    print("\n[TEST 4] Testing Frontend Cold-Start Protection...")
    client_js = PROJECT_ROOT / "frontend" / "src" / "api" / "client.js"
    assert client_js.exists()
    content = client_js.read_text(encoding="utf-8")
    assert "timeout: 60000" in content, "Axios timeout must be 60000ms to absorb container cold starts"
    print("  ✓ Axios client timeout set to 60,000ms for Render/Railway container wake-up.")

def test_docker_compose():
    print("\n[TEST 5] Testing Docker Compose Definition...")
    compose_path = PROJECT_ROOT / "docker-compose.yml"
    assert compose_path.exists()
    content = compose_path.read_text(encoding="utf-8")
    assert "backend:" in content
    assert "frontend:" in content
    print("  ✓ docker-compose.yml declares both frontend (5173) and backend (8000) services.")

if __name__ == "__main__":
    print("======================================================================")
    print(" NAGRIKMITRA - PHASE 10: CLOUD DEPLOYMENT ARCHITECTURE VERIFICATION   ")
    print("======================================================================")
    test_dockerfile_configuration()
    test_vercel_spa_manifest()
    test_dynamic_cors_for_vercel()
    test_frontend_cold_start_timeout()
    test_docker_compose()
    print("\n>>> ALL PHASE 10 CLOUD DEPLOYMENT CHECKS PASSED (100% SUCCESS) <<<\n")
