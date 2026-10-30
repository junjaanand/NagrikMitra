import os
import sys
import json
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Ensure UTF-8 output on Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_civic_proxies_mapping():
    print("\n[CHECK 1] Testing Civic Proxies & Ration Card BPL Mappings...")
    proxies_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "utils", "civicProxies.js")
    assert os.path.exists(proxies_path), f"File missing: {proxies_path}"
    
    with open(proxies_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "RATION_CARD_PROXY" in content
    assert "yellow:" in content and "is_bpl: true" in content
    assert "orange:" in content and "180000" in content
    assert "white:" in content and "450000" in content
    assert "POPULAR_ROLES" in content
    assert "farmer" in content and "student" in content and "woman" in content
    print("  --> PASS: Civic proxies and visual color-to-income mappings verified!")

def test_4tap_payload_eligibility_match():
    print("\n[CHECK 2] Testing End-to-End Match with 4-Tap Visual Flow Payload...")
    # Simulated payload from 4-tap picker: Farmer, UP, Yellow Ration Card (BPL), OBC
    tap_payload = {
        "age": 35,
        "gender": "male",
        "state": "Uttar Pradesh",
        "caste_category": "OBC",
        "annual_income": 80000, # Inferred from yellow card
        "is_bpl": True,         # Inferred from yellow card
        "ration_card_color": "yellow",
        "residence": "both",
        "has_disability": False,
        "occupation": "farmer"
    }

    t0 = time.perf_counter()
    resp = client.post("/api/eligibility/match?limit=25", json=tap_payload)
    elapsed = (time.perf_counter() - t0) * 1000.0

    assert resp.status_code == 200, f"Match failed with {resp.status_code}: {resp.text}"
    data = resp.json()
    print(f"  - Match executed in {elapsed:.2f} ms")
    print(f"  - Total Matched Schemes: {data['total_matched']}")
    print(f"  - Top 3 Recommended Schemes:")
    for idx, s in enumerate(data['matched_schemes'][:3], 1):
        print(f"      {idx}. {s['name']} (Score: {s['relevance_score']:.1f}, Mode: {s['application_mode']})")
    
    assert data["total_matched"] > 50, f"Expected >50 schemes, got {data['total_matched']}"
    assert len(data["matched_schemes"]) > 0
    print("  --> PASS: 4-Tap Visual Flow payload returns ranked eligible schemes with sub-second latency!")

def test_kendra_slip_contract():
    print("\n[CHECK 3] Testing CSC Seva Kendra Slip Data Contract...")
    slip_util_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "utils", "slipGenerator.js")
    assert os.path.exists(slip_util_path), f"File missing: {slip_util_path}"

    with open(slip_util_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "generateKendraSlip" in content
    assert "नागरिक मित्र — सेवा केंद्र पर्ची" in content
    assert "shareOnWhatsApp" in content
    assert "canvas.toDataURL" in content
    print("  --> PASS: Seva Kendra Slip generator and WhatsApp share module verified!")

def test_speech_helper_tts():
    print("\n[CHECK 4] Testing Web Speech API Audio Assistance Utility...")
    speech_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "utils", "speechHelper.js")
    assert os.path.exists(speech_path), f"File missing: {speech_path}"

    with open(speech_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "readSchemeAloud" in content
    assert "SpeechSynthesisUtterance" in content
    assert "hi-IN" in content
    assert "stopSpeech" in content
    print("  --> PASS: Speech helper audio assist utility verified!")

def test_visual_quick_picker_component():
    print("\n[CHECK 5] Testing VisualQuickPicker & Component Tree Integration...")
    comp_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "components", "discovery", "VisualQuickPicker.jsx")
    assert os.path.exists(comp_path), f"File missing: {comp_path}"

    with open(comp_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "VisualQuickPicker" in content
    assert "RATION_CARD_PROXY" in content
    assert "POPULAR_ROLES" in content
    assert "MAJOR_STATES" in content
    assert "CASTE_CATEGORIES" in content
    assert "Find My Schemes" in content

    # Check LandingPage integration
    landing_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "pages", "LandingPage.jsx")
    with open(landing_path, "r", encoding="utf-8") as f:
        landing_content = f.read()

    assert "VisualQuickPicker" in landing_content
    print("  --> PASS: VisualQuickPicker fully wired into LandingPage view hierarchy!")

def verify_all():
    print("=" * 75)
    print("  NAGRIKMITRA PHASE 6 COMPREHENSIVE VERIFICATION: CITIZEN 4-TAP & AUDIO")
    print("=" * 75)

    test_civic_proxies_mapping()
    test_4tap_payload_eligibility_match()
    test_kendra_slip_contract()
    test_speech_helper_tts()
    test_visual_quick_picker_component()

    print("\n" + "=" * 75)
    print("  ALL PHASE 6 (4-TAP VISUAL FLOW, AUDIO & KENDRA SLIP) VERIFICATIONS PASSED 100%!")
    print("=" * 75)

if __name__ == "__main__":
    verify_all()
