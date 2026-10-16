import sys
import os
import io
import time
import base64
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.ocr_service import process_document_ocr

client = TestClient(app)

def generate_synthetic_aadhaar() -> bytes:
    """Generates an in-memory synthetic Aadhaar card image for testing."""
    img = Image.new("RGB", (700, 380), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([(10, 10), (690, 370)], outline=(15, 41, 66), width=3)
    
    # Header
    draw.text((200, 30), "GOVERNMENT OF INDIA", fill=(0, 0, 0))
    draw.text((220, 55), "Unique Identification Authority of India", fill=(80, 80, 80))
    
    # Citizen details
    draw.text((50, 110), "Rajesh Kumar Sharma", fill=(0, 0, 0))
    draw.text((50, 150), "DOB: 15/08/1990", fill=(0, 0, 0))
    draw.text((50, 190), "Gender: MALE", fill=(0, 0, 0))
    draw.text((50, 230), "Address: Varanasi, Uttar Pradesh - 221001", fill=(0, 0, 0))
    
    # UID Number
    draw.text((200, 300), "3456 7890 1234", fill=(0, 0, 0))
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def generate_synthetic_pan() -> bytes:
    """Generates an in-memory synthetic PAN card image for testing."""
    img = Image.new("RGB", (700, 380), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([(10, 10), (690, 370)], outline=(30, 58, 138), width=3)
    
    # Header
    draw.text((180, 30), "INCOME TAX DEPARTMENT", fill=(0, 0, 0))
    draw.text((220, 55), "GOVT. OF INDIA", fill=(80, 80, 80))
    draw.text((190, 80), "Permanent Account Number Card", fill=(80, 80, 80))
    
    # Details
    draw.text((50, 130), "Ananya Sen Gupta", fill=(0, 0, 0))
    draw.text((50, 170), "Father's Name: Subir Sen Gupta", fill=(0, 0, 0))
    draw.text((50, 210), "12/04/1998", fill=(0, 0, 0))
    
    # PAN Number
    draw.text((220, 290), "ABCDE1234F", fill=(0, 0, 0))
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_aadhaar_ocr_extraction():
    print("\n--- 1. Testing Aadhaar Card OCR Extraction ---")
    aadhaar_bytes = generate_synthetic_aadhaar()
    
    t0 = time.perf_counter()
    res = process_document_ocr(aadhaar_bytes)
    latency = (time.perf_counter() - t0) * 1000
    
    print(f"Aadhaar OCR processed in {latency:.2f} ms")
    print(f"Document Type: {res.document_type}")
    print(f"Extracted Data: {res.extracted_data.model_dump()}")
    print(f"Confidence: {res.confidence_score}")
    
    assert res.document_type == "Aadhaar", f"Expected Aadhaar, got {res.document_type}"
    assert res.extracted_data.gender == "male"
    assert res.extracted_data.age == 36  # 2026 - 1990
    assert "1234" in str(res.extracted_data.masked_id_number)
    assert res.extracted_data.state == "Uttar Pradesh"
    assert res.confidence_score >= 0.75
    print(" Aadhaar Card OCR Extraction PASSED!")

def test_pan_ocr_extraction():
    print("\n--- 2. Testing PAN Card OCR Extraction ---")
    pan_bytes = generate_synthetic_pan()
    
    t0 = time.perf_counter()
    res = process_document_ocr(pan_bytes)
    latency = (time.perf_counter() - t0) * 1000
    
    print(f"PAN OCR processed in {latency:.2f} ms")
    print(f"Document Type: {res.document_type}")
    print(f"Extracted PAN: {res.extracted_data.id_number}")
    print(f"Extracted DOB: {res.extracted_data.dob} (Age: {res.extracted_data.age})")
    
    assert res.document_type == "PAN", f"Expected PAN, got {res.document_type}"
    assert res.extracted_data.id_number == "ABCDE1234F"
    assert res.extracted_data.dob == "12/04/1998"
    assert res.extracted_data.age == 28  # 2026 - 1998
    print(" PAN Card OCR Extraction PASSED!")

def test_ocr_api_endpoints():
    print("\n--- 3. Testing OCR API Endpoints ---")
    
    # 1. Supported Docs Catalog
    r_docs = client.get("/api/ocr/supported-docs")
    assert r_docs.status_code == 200
    docs = r_docs.json()
    print(f"Supported document types: {[d['doc_type'] for d in docs]}")
    assert len(docs) >= 3

    # 2. File Upload Endpoint (POST /api/ocr/scan-file)
    auth_headers = {"Authorization": "Bearer demo-session-farmer"}
    aadhaar_bytes = generate_synthetic_aadhaar()
    files = {"file": ("test_aadhaar.png", aadhaar_bytes, "image/png")}
    r_file = client.post("/api/ocr/scan-file", headers=auth_headers, files=files)
    assert r_file.status_code == 200
    file_res = r_file.json()
    assert file_res["document_type"] == "Aadhaar"
    print(f"POST /api/ocr/scan-file -> Success: {file_res['document_type']} with confidence {file_res['confidence_score']}")

    # 3. Live Camera Frame Endpoint (POST /api/ocr/scan-frame)
    pan_bytes = generate_synthetic_pan()
    b64_str = base64.b64encode(pan_bytes).decode("utf-8")
    data_uri = f"data:image/png;base64,{b64_str}"
    
    r_frame = client.post("/api/ocr/scan-frame", headers=auth_headers, json={"image_base64": data_uri})
    assert r_frame.status_code == 200
    frame_res = r_frame.json()
    assert frame_res["document_type"] == "PAN"
    print(f"POST /api/ocr/scan-frame -> Success: {frame_res['document_type']} (Latency: {frame_res['latency_ms']} ms)")

    # 4. End-to-End Bridge: Use OCR prefilled profile to match schemes
    prefilled = frame_res["prefilled_profile"]
    print(f"Pre-filled profile from OCR: {prefilled}")
    r_match = client.post("/api/eligibility/match?limit=10", json=prefilled)
    assert r_match.status_code == 200
    match_data = r_match.json()
    print(f"OCR -> Rule Engine Bridge: {match_data['total_matched']} schemes matched automatically!")
    assert match_data["total_matched"] > 0
    print(" OCR API Endpoints & Eligibility Bridge PASSED!")

if __name__ == "__main__":
    print("========================================")
    print(" NAGRIKMITRA DAY 4 VERIFICATION SUITE   ")
    print("========================================")
    test_aadhaar_ocr_extraction()
    test_pan_ocr_extraction()
    test_ocr_api_endpoints()
    print("\n========================================")
    print(" ALL DAY 4 TASKS COMPLETED & VERIFIED! ")
    print("========================================")
