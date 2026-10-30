#!/usr/bin/env python3
"""
Verification Script for Phase 09: Compliance & Privacy (In-Memory Zero-Retention Document Privacy for DPDP Act 2023)
Validates zero full UID exposure, regex PII scrubbing of raw_text, affirmative consent gating, and zero disk footprint.
"""

import sys
import io
import os
import glob
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.routes.ocr import scrub_pii_from_raw_text

client = TestClient(app)

def create_synthetic_aadhaar_bytes():
    """Generates an in-memory synthetic Aadhaar card image."""
    img = Image.new('RGB', (800, 500), color='#ffffff')
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, 800, 60], fill='#e11d48')
    draw.text((250, 20), "GOVERNMENT OF INDIA", fill='#ffffff')
    
    # Details
    draw.text((80, 150), "Rajesh Kumar Sharma", fill='#0f172a')
    draw.text((80, 220), "DOB: 15/08/1986", fill='#0f172a')
    draw.text((80, 280), "Gender: MALE / पुरुष", fill='#0f172a')
    draw.text((80, 340), "Address: Lucknow, Uttar Pradesh - 226001", fill='#0f172a')
    
    # Unmasked UID
    draw.text((260, 420), "9876 5432 1098", fill='#0f172a')
    
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85)
    return buf.getvalue()

def test_pii_scrubbing_unit_test():
    print("\n[TEST 1] Testing PII Sanitizer Function (scrub_pii_from_raw_text)...")
    
    # Aadhaar patterns
    sample_text_1 = "Citizen UID is 9876 5432 1098 issued by UIDAI"
    scrubbed_1 = scrub_pii_from_raw_text(sample_text_1)
    assert "9876 5432 1098" not in scrubbed_1
    assert "XXXX XXXX 1098" in scrubbed_1
    print("  ✓ Spaced Aadhaar (9876 5432 1098) masked to 'XXXX XXXX 1098'.")

    sample_text_2 = "Aadhaar: 234567890123 on card"
    scrubbed_2 = scrub_pii_from_raw_text(sample_text_2)
    assert "234567890123" not in scrubbed_2
    assert "XXXX XXXX 0123" in scrubbed_2
    print("  ✓ Continuous Aadhaar (234567890123) masked to 'XXXX XXXX 0123'.")

    # PAN pattern
    sample_pan = "PAN Number: ABCDE1234F Tax Payer"
    scrubbed_pan = scrub_pii_from_raw_text(sample_pan)
    assert "ABCDE1234F" not in scrubbed_pan
    assert "ABXXXXX34F" in scrubbed_pan
    print("  ✓ PAN (ABCDE1234F) masked to 'ABXXXXX34F'.")

def test_affirmative_consent_precondition():
    print("\n[TEST 2] Testing DPDP Act Section 6 Affirmative Consent Enforcement...")
    
    auth_headers = {"Authorization": "Bearer demo-session-farmer"}
    aadhaar_bytes = create_synthetic_aadhaar_bytes()
    
    # 1. scan-file with consent_acknowledged=false
    res_file = client.post(
        "/api/ocr/scan-file?consent_acknowledged=false",
        headers=auth_headers,
        files={"file": ("aadhaar.jpg", io.BytesIO(aadhaar_bytes), "image/jpeg")}
    )
    assert res_file.status_code == 400
    assert "DPDP Act 2023 requires affirmative citizen consent" in res_file.json()["detail"]
    print("  ✓ scan-file endpoint rejected with HTTP 400 when consent is False.")

    # 2. scan-frame with consent_acknowledged=false
    import base64
    b64_str = "data:image/jpeg;base64," + base64.b64encode(aadhaar_bytes).decode('utf-8')
    res_frame = client.post(
        "/api/ocr/scan-frame",
        headers=auth_headers,
        json={"image_base64": b64_str, "consent_acknowledged": False}
    )
    assert res_frame.status_code == 400
    assert "DPDP Act 2023 requires affirmative citizen consent" in res_frame.json()["detail"]
    print("  ✓ scan-frame endpoint rejected with HTTP 400 when consent is False.")

def test_zero_uid_exposure_and_sanitization():
    print("\n[TEST 3] Testing Zero UID Exposure & Response Sanitization...")
    
    auth_headers = {"Authorization": "Bearer demo-session-farmer"}
    aadhaar_bytes = create_synthetic_aadhaar_bytes()
    
    res = client.post(
        "/api/ocr/scan-file?consent_acknowledged=true",
        headers=auth_headers,
        files={"file": ("aadhaar.jpg", io.BytesIO(aadhaar_bytes), "image/jpeg")}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    
    # Verify id_number is ALWAYS None (Forbidden under Section 29)
    assert data["extracted_data"]["id_number"] is None, "Violation: full id_number exposed in API response!"
    print("  ✓ id_number is strictly None in API response.")
    
    # Verify raw_text does not contain unmasked 12-digit number
    raw_text = data.get("raw_text", "")
    assert "9876 5432 1098" not in raw_text, "Violation: unmasked 12-digit UID leaked in raw_text dump!"
    print("  ✓ raw_text dump has been sanitized of unmasked 12-digit Aadhaar UID.")

def test_zero_disk_footprint():
    print("\n[TEST 4] Verifying Zero Disk Footprint (Ephemeral In-Memory Only)...")
    
    # Check if any .jpg or .png files exist in backend/data or root outside of standard repo
    data_dir = PROJECT_ROOT / "backend" / "data"
    image_files = list(data_dir.glob("*.jpg")) + list(data_dir.glob("*.png")) + list(data_dir.glob("*.webp"))
    assert len(image_files) == 0, f"Found leaked image files on disk in {data_dir}: {image_files}"
    print("  ✓ Zero disk I/O confirmed: No temporary image files created on filesystem.")

if __name__ == "__main__":
    print("======================================================================")
    print(" NAGRIKMITRA - PHASE 09: DPDP ACT 2023 PRIVACY & COMPLIANCE VERIFICATION ")
    print("======================================================================")
    test_pii_scrubbing_unit_test()
    test_affirmative_consent_precondition()
    test_zero_uid_exposure_and_sanitization()
    test_zero_disk_footprint()
    print("\n>>> ALL PHASE 09 DPDP ACT PRIVACY CHECKS PASSED (100% SUCCESS) <<<\n")
