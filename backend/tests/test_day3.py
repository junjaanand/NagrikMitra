import sys
import os
import time
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.rag_pipeline import retrieve_scheme_context, process_chat_with_rag, ensure_rag_index_populated
from app.services.llm_client import llm_client, parse_profile_regex_fallback

client = TestClient(app)

def test_rag_knowledge_retrieval():
    print("\n--- 1. Testing RAG Knowledge Retrieval ---")
    ensure_rag_index_populated(min_count=50)
    
    # Query 1: Farmer & Agriculture
    t0 = time.perf_counter()
    ctx1, sources1 = retrieve_scheme_context("farmer agricultural credit financial subsidy crop", n_results=3)
    latency1 = (time.perf_counter() - t0) * 1000
    print(f"RAG Retrieval 1 (Farmer): {len(sources1)} sources retrieved in {latency1:.2f} ms")
    assert len(sources1) > 0, "Expected at least one scheme retrieved"
    print(f"Retrieved schemes: {[s['name'][:40] for s in sources1]}")
    
    # Query 2: Scholarships for students
    ctx2, sources2 = retrieve_scheme_context("scholarship fellowship higher education for girls", n_results=3)
    print(f"RAG Retrieval 2 (Scholarship): {[s['name'][:40] for s in sources2]}")
    assert len(sources2) > 0
    print(" RAG Knowledge Retrieval PASSED!")

def test_slot_filling_entity_extraction():
    print("\n--- 2. Testing Slot-Filling Entity Extraction ---")
    
    # Hindi slot extraction
    hindi_text = "मैं 45 साल का किसान हूँ, उत्तर प्रदेश से, मेरी सालाना आय 1.5 लाख है"
    slots_hi = llm_client.extract_profile_slots(hindi_text)
    print(f"Hindi Extraction Input: '{hindi_text}'")
    print(f"Extracted Slots: {slots_hi}")
    assert slots_hi.get("age") == 45, f"Expected age 45, got {slots_hi.get('age')}"
    assert slots_hi.get("occupation") == "farmer", f"Expected farmer, got {slots_hi.get('occupation')}"
    assert slots_hi.get("state") == "Uttar Pradesh", f"Expected Uttar Pradesh, got {slots_hi.get('state')}"
    assert slots_hi.get("annual_income") == 150000, f"Expected 150000, got {slots_hi.get('annual_income')}"
    print(" Hindi Slot Extraction PASSED!")

    # English slot extraction
    en_text = "I am a 21 year old female student from Maharashtra belonging to SC category"
    slots_en = llm_client.extract_profile_slots(en_text)
    print(f"English Extraction Input: '{en_text}'")
    print(f"Extracted Slots: {slots_en}")
    assert slots_en.get("age") == 21, f"Expected age 21, got {slots_en.get('age')}"
    assert slots_en.get("gender") == "female", f"Expected female, got {slots_en.get('gender')}"
    assert slots_en.get("state") == "Maharashtra", f"Expected Maharashtra, got {slots_en.get('state')}"
    assert slots_en.get("caste_category") == "SC", f"Expected SC, got {slots_en.get('caste_category')}"
    print(" English Slot Extraction PASSED!")

def test_multi_tier_fallback_chat():
    print("\n--- 3. Testing Multi-Tier Fallback Chat Pipeline ---")
    
    # Chat message testing
    user_query = "What documents do I need to apply for farmer assistance schemes in UP?"
    t0 = time.perf_counter()
    res = process_chat_with_rag(user_query)
    latency = (time.perf_counter() - t0) * 1000
    
    print(f"Chat executed in {latency:.2f} ms")
    print(f"Active Provider: {res['provider']} (Tier {res['tier']})")
    print(f"Model: {res['model']}")
    print(f"Response preview: {res['reply'][:150]}...")
    assert len(res["reply"]) > 20, "Expected meaningful reply"
    assert len(res["sources"]) > 0, "Expected scheme sources in reply"
    print(" Multi-Tier Fallback Chat Pipeline PASSED!")

def test_chat_api_endpoints():
    print("\n--- 4. Testing Chat API Endpoints ---")
    
    # 1. Provider Status
    r_status = client.get("/api/chat/status")
    assert r_status.status_code == 200
    status_data = r_status.json()
    print(f"GET /api/chat/status -> Primary: {status_data['primary_provider']}, Hierarchy tiers: {len(status_data['fallback_hierarchy'])}")
    assert status_data["primary_provider"] == "groq"
    assert status_data["fallback_hierarchy"][0]["provider"] == "Groq"
    assert status_data["fallback_hierarchy"][1]["provider"] == "Google Gemini"
    assert status_data["fallback_hierarchy"][2]["provider"] == "Local Grounded Synthesizer"

    # 2. Slot Extraction Endpoint
    auth_headers = {"Authorization": "Bearer demo-session-farmer"}
    r_slot = client.post("/api/chat/extract-slots", headers=auth_headers, json={"text": "I live in Gujarat and I am a 30 year old BPL card holder"})
    assert r_slot.status_code == 200
    res_json = r_slot.json()
    slot_data = res_json.get("slots") or res_json.get("extracted_slots")
    print(f"POST /api/chat/extract-slots -> {slot_data}")
    assert slot_data.get("state") == "Gujarat"
    assert slot_data.get("age") == 30
    assert slot_data.get("is_bpl") is True

    # 3. Chat Message Endpoint (Hindi)
    r_chat = client.post("/api/chat/message", headers=auth_headers, json={
        "message": "मुझे छात्रवृत्ति योजना की जानकारी दो",
        "history": []
    })
    assert r_chat.status_code == 200
    chat_data = r_chat.json()
    print(f"POST /api/chat/message (Hindi) -> provider: {chat_data['provider']}, reply: {chat_data['reply'][:80]}...")
    assert len(chat_data["reply"]) > 15

    print(" Chat API Endpoints PASSED!")

if __name__ == "__main__":
    print("========================================")
    print(" NAGRIKMITRA DAY 3 VERIFICATION SUITE   ")
    print("========================================")
    test_rag_knowledge_retrieval()
    test_slot_filling_entity_extraction()
    test_multi_tier_fallback_chat()
    test_chat_api_endpoints()
    print("\n========================================")
    print(" ALL DAY 3 TASKS COMPLETED & VERIFIED! ")
    print("========================================")
