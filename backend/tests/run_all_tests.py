import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

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

# Day 8 Tests: Analytics & Caching
from tests.test_day8_analytics import test_analytics_endpoint_status_and_schema
test_analytics_endpoint_status_and_schema()

# Day 9 Tests: Voice & OCR Camera Frame
from tests.test_day9_voice_ocr import test_chat_voice_rag_endpoint, test_ocr_camera_frame_endpoint
test_chat_voice_rag_endpoint()
test_ocr_camera_frame_endpoint()

# Day 10 Tests: Scheme Comparison Matrix & Document Readiness
from tests.test_day10_matrix import test_scheme_comparison_retrieval, test_document_tokenization_and_readiness
test_scheme_comparison_retrieval()
test_document_tokenization_and_readiness()

# Day 11 Tests: Dynamic Ingestion, Dual-Write & OGD Synchronization
from tests.test_day11_dynamic_ingestion import test_dynamic_scheme_creation_and_dual_write, test_ogd_synchronization_service, test_live_web_gazette_grounding_fallback
test_dynamic_scheme_creation_and_dual_write()
test_ogd_synchronization_service()
test_live_web_gazette_grounding_fallback()

# Day 12 Tests: Strict Authentication, RBAC & Compute Rate Limiting
from tests.test_day12_auth_gating import test_unauthenticated_requests_blocked, test_authenticated_citizen_chat_and_ocr, test_rbac_scheme_ingestion_controls, test_compute_rate_limiting
test_unauthenticated_requests_blocked()
test_authenticated_citizen_chat_and_ocr()
test_rbac_scheme_ingestion_controls()
test_compute_rate_limiting()

# Production Hardening Tests
from tests.test_production_hardening import test_cors_headers_and_restrictions, test_chat_payload_length_constraints, test_ocr_upload_file_size_cutoff, test_cached_analytics_submillisecond_latency, test_rule_engine_universal_and_multistate_matching
test_cors_headers_and_restrictions()
test_chat_payload_length_constraints()
test_ocr_upload_file_size_cutoff()
test_cached_analytics_submillisecond_latency()
test_rule_engine_universal_and_multistate_matching()

print("\n=======================================================")
print("   🎉 ALL 12 DAYS & PRODUCTION HARDENING VERIFIED!     ")
print("=======================================================\n")
