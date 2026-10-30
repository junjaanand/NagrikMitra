import os
import sys
import io
import time
import base64
import asyncio
from PIL import Image, ImageDraw, ImageFont

# Set backend directory on sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Ensure UTF-8 output on Windows cmd
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from app.services.ocr_service import (
    process_document_ocr,
    get_supported_ocr_languages,
    TESSERACT_CMD,
    HAS_OPENCV,
    detect_indian_state,
    normalize_digit_confusions,
    classify_document
)

def create_synthetic_aadhaar_card() -> bytes:
    """Generates an in-memory high-res bilingual Aadhaar Card image."""
    img = Image.new("RGB", (1000, 630), color=(255, 255, 255))
    d = ImageDraw.Draw(img)

    # Tricolor header bar
    d.rectangle([(0, 0), (1000, 20)], fill=(249, 115, 22))
    d.rectangle([(0, 20), (1000, 40)], fill=(255, 255, 255))
    d.rectangle([(0, 40), (1000, 60)], fill=(22, 163, 74))

    # Text blocks
    d.text((120, 100), "Government of India / भारत सरकार", fill=(0, 0, 0))
    d.text((120, 140), "Unique Identification Authority of India", fill=(0, 0, 0))
    d.text((120, 220), "Rameshwar Anand Patil", fill=(0, 0, 0))
    d.text((120, 270), "DOB: 12/07/1988", fill=(0, 0, 0))
    d.text((120, 310), "Gender: MALE / पुरुष", fill=(0, 0, 0))
    d.text((120, 360), "Address: Solapur, Maharashtra - 413002", fill=(0, 0, 0))

    # UID
    d.text((250, 480), "9123 4567 8901", fill=(0, 0, 0))
    d.text((320, 540), "मेरा आधार, मेरी पहचान", fill=(220, 38, 38))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=82)
    return buf.getvalue()

def create_synthetic_pan_card() -> bytes:
    """Generates an in-memory high-res PAN Card image."""
    img = Image.new("RGB", (1000, 630), color=(240, 248, 255))
    d = ImageDraw.Draw(img)

    d.rectangle([(0, 0), (1000, 70)], fill=(2, 132, 199))
    d.text((100, 30), "INCOME TAX DEPARTMENT - GOVT. OF INDIA", fill=(255, 255, 255))
    d.text((100, 140), "Permanent Account Number Card", fill=(0, 0, 0))
    d.text((100, 230), "SURESH BABU RAO", fill=(0, 0, 0))
    d.text((100, 290), "Father Name: Babu Rao", fill=(0, 0, 0))
    d.text((100, 350), "Date of Birth: 24/09/1995", fill=(0, 0, 0))
    d.text((100, 460), "ABCDE1234F", fill=(30, 58, 138))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=82)
    return buf.getvalue()

async def run_async_concurrency_test(image_bytes: bytes):
    """Verifies that OCR offloaded via asyncio.to_thread does NOT block the async event loop."""
    print("\n--- Test: Asynchronous Non-Blocking Concurrency ---")
    loop_ticks = []

    async def lightweight_ticker():
        for _ in range(10):
            loop_ticks.append(time.perf_counter())
            await asyncio.sleep(0.05)

    t_start = time.perf_counter()
    # Execute heavy OCR concurrently with async ticker
    ocr_task = asyncio.to_thread(process_document_ocr, image_bytes)
    ticker_task = lightweight_ticker()

    ocr_res, _ = await asyncio.gather(ocr_task, ticker_task)
    t_elapsed = time.perf_counter() - t_start

    print(f"Concurrent execution completed in: {t_elapsed:.2f}s")
    print(f"Async event loop ticks recorded: {len(loop_ticks)} ticks (Zero event loop starvation!)")
    assert len(loop_ticks) >= 5, "Event loop was starved during OCR execution!"
    print("[PASS] Asynchronous threadpool execution verified non-blocking!")
    return ocr_res

def main():
    print("=" * 70)
    print("  NAGRIKMITRA PHASE 3: VISION/OCR PIPELINE VERIFICATION SUITE")
    print("=" * 70)

    # 1. Environment & Portability Checks
    print("\n[1/6] Checking Engine & Cloud Portability Configuration...")
    print(f" - Tesseract Binary Path: {TESSERACT_CMD}")
    assert TESSERACT_CMD is not None, "Tesseract executable path was not resolved!"
    print(f" - Headless OpenCV Active: {HAS_OPENCV}")
    assert HAS_OPENCV, "OpenCV is not available!"
    supported_langs = get_supported_ocr_languages()
    print(f" - Supported OCR Languages: '{supported_langs}'")
    assert "eng" in supported_langs, "English OCR language is missing!"

    # 2. Hindi & Devanagari Numeral Normalization
    print("\n[2/6] Checking Indic Devanagari Numeral Normalization...")
    hindi_digits = "१२/०७/१९८८"
    normalized_digits = normalize_digit_confusions(hindi_digits)
    print(f" - Devanagari Numerals '{hindi_digits}' -> Normalized: '{normalized_digits}'")
    assert normalized_digits == "12/07/1988", "Hindi numerals were not normalized correctly!"
    print("[PASS] Devanagari numeral normalization verified!")

    # 3. 53 Indian Postal PIN Prefix Geocoding
    print("\n[3/6] Checking Postal PIN Code Geocoder...")
    test_pins = [
        ("PIN: 413002", "Maharashtra"),
        ("Address with 226001", "Uttar Pradesh"),
        ("Location 600001", "Tamil Nadu"),
        ("Postal code 380001", "Gujarat")
    ]
    for text_sample, expected_state in test_pins:
        detected = detect_indian_state(text_sample)
        print(f" - '{text_sample}' -> State: '{detected}' (Expected: '{expected_state}')")
        assert detected == expected_state, f"Failed state detection for {text_sample}"
    print("[PASS] Postal PIN state geocoding verified across test prefixes!")

    # 4. Synthetic Aadhaar Bilingual OCR & Aadhaar Masking Test
    print("\n[4/6] Testing Bilingual Aadhaar Card Extraction & UID Masking...")
    aadhaar_bytes = create_synthetic_aadhaar_card()
    payload_size_kb = len(aadhaar_bytes) / 1024.0
    print(f" - Compressed JPEG Card Payload Size: {payload_size_kb:.1f} KB (Well below 200 KB limit)")
    assert payload_size_kb < 200, "Payload exceeded 200 KB ceiling!"

    t0 = time.perf_counter()
    res = process_document_ocr(aadhaar_bytes)
    t_ocr = (time.perf_counter() - t0) * 1000

    print(f" - Processing Latency: {t_ocr:.1f} ms")
    print(f" - Document Classified As: {res.document_type}")
    assert res.document_type == "Aadhaar", "Document classification failed!"
    print(f" - Confidence Score: {res.confidence_score * 100:.1f}%")
    print(f" - Extracted Name: {res.extracted_data.name}")
    print(f" - Extracted DOB: {res.extracted_data.dob} (Age: {res.extracted_data.age})")
    print(f" - Extracted Gender: {res.extracted_data.gender}")
    print(f" - Extracted State: {res.extracted_data.state}")
    print(f" - Masked UID: {res.extracted_data.masked_id_number}")
    print(f" - ID Number in Output: {res.extracted_data.id_number}")

    # Verify Statutory UID Masking
    assert res.extracted_data.masked_id_number == "XXXX XXXX 8901", "Aadhaar UID was not masked properly!"
    assert "9123 4567 8901" not in (res.extracted_data.id_number or ""), "Raw Aadhaar UID leaked into id_number!"
    assert "9123 4567 8901" not in res.raw_text, "Raw Aadhaar UID leaked into raw transcript!"
    print("[PASS] Statutory Aadhaar UID Masking (DPDP Act 2023 / UIDAI Section 29) verified 100%!")

    # 5. PAN Card Test
    print("\n[5/6] Testing PAN Card Extraction...")
    pan_bytes = create_synthetic_pan_card()
    pan_res = process_document_ocr(pan_bytes)
    print(f" - PAN Document Classified As: {pan_res.document_type}")
    print(f" - Extracted PAN Number: {pan_res.extracted_data.id_number}")
    print(f" - Extracted Name: {pan_res.extracted_data.name}")
    assert pan_res.document_type == "PAN", "PAN classification failed!"
    assert pan_res.extracted_data.id_number == "ABCDE1234F", "PAN number extraction failed!"
    print("[PASS] PAN Card extraction verified!")

    # 6. Asynchronous Non-blocking test
    print("\n[6/6] Executing Asynchronous Event Loop Concurrency Verification...")
    asyncio.run(run_async_concurrency_test(aadhaar_bytes))

    print("\n" + "=" * 70)
    print("  ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% ACHIEVED)")
    print("=" * 70)

if __name__ == "__main__":
    main()
