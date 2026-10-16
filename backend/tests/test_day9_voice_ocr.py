import sys
import os
import io
import base64
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_chat_voice_rag_endpoint():
    """Verify Day 9 chat endpoint with multilingual query and slot extraction."""
    payload = {
        "message": "मैं उत्तर प्रदेश का 38 वर्षीय किसान हूँ। मेरी वार्षिक आय 1.5 लाख है।",
        "history": [],
        "current_profile": {"age": 25, "state": "Delhi"}
    }
    headers = {"Authorization": "Bearer demo-session-farmer"}
    res = client.post("/api/chat/message", headers=headers, json=payload)
    assert res.status_code == 200, f"Chat endpoint failed: {res.status_code}"
    data = res.json()
    
    assert "reply" in data and len(data["reply"]) > 0
    assert "extracted_slots" in data
    assert data["extracted_slots"].get("occupation") == "farmer"
    assert data["extracted_slots"].get("state") == "Uttar Pradesh"
    assert len(data.get("recommended_schemes", [])) > 0
    print(" test_chat_voice_rag_endpoint PASSED!")

def test_ocr_camera_frame_endpoint():
    """Verify Day 9 WebRTC camera frame OCR processing."""
    # Create in-memory test image
    img = Image.new("RGB", (600, 350), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((30, 30), "Government of India", fill=(0, 0, 0))
    draw.text((30, 70), "Rajesh Kumar Sharma", fill=(0, 0, 0))
    draw.text((30, 110), "DOB: 15/08/1986", fill=(0, 0, 0))
    draw.text((30, 150), "Male", fill=(0, 0, 0))
    draw.text((30, 190), "9876 5432 1098", fill=(0, 0, 0))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    
    headers = {"Authorization": "Bearer demo-session-farmer"}
    res = client.post("/api/ocr/scan-frame", headers=headers, json={"image_base64": b64})
    assert res.status_code == 200, f"OCR scan-frame failed: {res.status_code}"
    data = res.json()
    
    assert data["document_type"] == "Aadhaar"
    assert "extracted_data" in data
    assert data["extracted_data"]["masked_id_number"] == "XXXX XXXX 1098"
    print(" test_ocr_camera_frame_endpoint PASSED!")

if __name__ == "__main__":
    test_chat_voice_rag_endpoint()
    test_ocr_camera_frame_endpoint()
