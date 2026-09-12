import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

print("\n=======================================================")
print("   NAGRIKMITRA MASTER TEST SUITE (DAYS 1 TO 4)         ")
print("=======================================================")

# Day 1 Tests
from tests.test_day1 import test_sqlite_database, test_chroma_vector_store, test_fastapi_endpoints
test_sqlite_database()
test_chroma_vector_store()
test_fastapi_endpoints()

# Day 2 Tests
from tests.test_day2 import test_rule_engine_test_cases, test_schemes_api_endpoints, test_eligibility_api_endpoints
test_rule_engine_test_cases()
test_schemes_api_endpoints()
test_eligibility_api_endpoints()

# Day 3 Tests
from tests.test_day3 import test_rag_knowledge_retrieval, test_slot_filling_entity_extraction, test_multi_tier_fallback_chat, test_chat_api_endpoints
test_rag_knowledge_retrieval()
test_slot_filling_entity_extraction()
test_multi_tier_fallback_chat()
test_chat_api_endpoints()

# Day 4 Tests
from tests.test_day4 import test_aadhaar_ocr_extraction, test_pan_ocr_extraction, test_ocr_api_endpoints
test_aadhaar_ocr_extraction()
test_pan_ocr_extraction()
test_ocr_api_endpoints()

print("\n=======================================================")
print("   🎉 ALL 4 DAYS OF BACKEND TESTS PASSED (100%)       ")
print("=======================================================\n")
