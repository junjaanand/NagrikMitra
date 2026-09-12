import os
import re
import io
import time
import base64
import logging
from typing import Dict, Any, Tuple, Optional, List
from PIL import Image
import numpy as np

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

import pytesseract
from app.models.ocr import ExtractedDocumentData, OCRScanResponse

logger = logging.getLogger("NagrikMitra.OCR")

# Locate Tesseract binary on Windows / Linux
POSSIBLE_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    "/usr/bin/tesseract",
    "/usr/local/bin/tesseract"
]

for p in POSSIBLE_TESSERACT_PATHS:
    if os.path.exists(p):
        pytesseract.pytesseract.tesseract_cmd = p
        break

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

def preprocess_image(pil_img: Image.Image) -> Image.Image:
    """
    Applies image enhancement, adaptive thresholding, and noise reduction for higher OCR fidelity.
    """
    target_width = 1200
    if pil_img.width < target_width:
        ratio = target_width / float(pil_img.width)
        new_height = int(float(pil_img.height) * ratio)
        pil_img = pil_img.resize((target_width, new_height), Image.Resampling.LANCZOS)

    if HAS_OPENCV:
        try:
            cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            denoised = cv2.bilateralFilter(gray, 9, 75, 75)
            _, binarized = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            return Image.fromarray(binarized)
        except Exception as e:
            logger.warning(f"OpenCV preprocessing error: {e}. Using PIL fallback.")

    gray = pil_img.convert("L")
    threshold = 140
    binarized = gray.point(lambda p: 255 if p > threshold else 0)
    return binarized

def decode_image_input(image_input: Any) -> Image.Image:
    """Decodes image from bytes, base64 data URI, or PIL.Image."""
    if isinstance(image_input, Image.Image):
        return image_input

    if isinstance(image_input, (bytes, bytearray)):
        return Image.open(io.BytesIO(image_input))

    if isinstance(image_input, str):
        if "base64," in image_input:
            image_input = image_input.split("base64,")[1]
        raw_bytes = base64.b64decode(image_input.strip())
        return Image.open(io.BytesIO(raw_bytes))

    raise ValueError("Unsupported image input format. Expected PIL.Image, bytes, or base64 string.")

def classify_document(text: str) -> str:
    """Classifies document type based on structural keywords."""
    lower = text.lower()
    
    if re.search(r'\b[a-z]{5}[0-9]{4}[a-z]{1}\b', lower) or "income tax" in lower or "permanent account" in lower:
        return "PAN"
        
    if "unique identification" in lower or "aadhaar" in lower or "मेरा आधार" in lower or "uidai" in lower or re.search(r'\b[2-9]\d{3}\s\d{4}\s\d{4}\b', text):
        return "Aadhaar"
        
    if "ration" in lower or "food & civil supplies" in lower or "fair price" in lower or "antyodaya" in lower:
        return "Ration Card"

    return "Aadhaar" if any(k in lower for k in ("government of india", "bharat sarkar", "dob", "birth")) else "Unknown"

def parse_dob_and_age(text: str) -> Tuple[Optional[str], Optional[int]]:
    """
    Robust date parser handling:
    15/08/1990, 15-08-1990, 15.08.1990, 1508-1990, 15081990, 15 08 1990, YOB: 1990
    """
    # 1. Standard format with separators
    match = re.search(r'\b(\d{2})[/\-.\s](\d{2})[/\-.\s](\d{4})\b', text)
    if not match:
        # Format with partial or missing separator e.g. 15081990 or 1508-1990
        match = re.search(r'\b(\d{2})[/\-.\s]?(\d{2})[/\-.\s]?(\d{4})\b', text)

    if match:
        d, m, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1 <= d <= 31 and 1 <= m <= 12 and 1920 <= y <= 2026:
            dob_str = f"{d:02d}/{m:02d}/{y}"
            age = max(1, 2026 - y)
            return dob_str, age

    # Fallback to Year of Birth only e.g. "Year of Birth: 1990"
    yob_match = re.search(r'(?:Year of Birth|YOB|जन्म वर्ष)[:\s]*(\d{4})\b', text, re.IGNORECASE)
    if yob_match:
        year = int(yob_match.group(1))
        if 1920 <= year <= 2026:
            return f"01/01/{year}", max(1, 2026 - year)

    return None, None

def detect_indian_state(text: str) -> Optional[str]:
    """Detects Indian state from text using direct and fuzzy word matching."""
    lower = text.lower()
    
    # 1. Exact match
    for st in INDIAN_STATES:
        if re.search(r'\b' + re.escape(st.lower()) + r'\b', lower):
            return st
            
    # 2. Fuzzy / partial match for two-word states
    for st in INDIAN_STATES:
        words = st.lower().split()
        if len(words) == 2 and words[1] in ("pradesh", "bengal", "kashmir", "islands", "nadu", "diu"):
            # Check if second word is present and first word prefix matches
            if words[1] in lower and words[0][:4] in lower:
                return st

    return None

def extract_name_from_lines(lines: List[str], exclude_keywords: List[str]) -> Optional[str]:
    """Extracts citizen name by finding high-confidence person name lines."""
    candidates = []
    
    for line in lines:
        cleaned = re.sub(r'[^a-zA-Z\s]', ' ', line).strip()
        words = cleaned.split()
        
        # Valid name length: 2 to 4 words
        if 2 <= len(words) <= 4:
            line_lower = cleaned.lower()
            if any(k in line_lower for k in exclude_keywords):
                continue
                
            # Check word properties: at least 2 letters per word
            if all(len(w) >= 2 for w in words):
                # Score candidate: prefer Title Case words (e.g. "Rajesh Kumar Sharma")
                title_score = sum(1 for w in words if w.istitle())
                candidates.append((title_score, cleaned))

    if candidates:
        # Sort by title score descending
        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1].title()
        
    return None

def extract_aadhaar_fields(text: str) -> Dict[str, Any]:
    """Extracts UID, Name, DOB, Gender, and State from Aadhaar card text."""
    fields = {}

    # 1. 12-digit UID pattern
    uid_match = re.search(r'\b([2-9]\d{3}\s\d{4}\s\d{4})\b', text)
    if not uid_match:
        uid_match = re.search(r'\b([2-9]\d{11})\b', text)

    if uid_match:
        raw_uid = uid_match.group(1).replace(" ", "")
        fields["id_number"] = f"{raw_uid[:4]} {raw_uid[4:8]} {raw_uid[8:]}"
        fields["masked_id_number"] = f"XXXX XXXX {raw_uid[8:]}"

    # 2. Date of Birth and Age
    dob, age = parse_dob_and_age(text)
    if dob:
        fields["dob"] = dob
        fields["age"] = age

    # 3. Gender
    if re.search(r'\b(FEMALE|WOMAN|महिला|स्त्री)\b', text, re.IGNORECASE):
        fields["gender"] = "female"
    elif re.search(r'\b(MALE|MAN|पुरुष)\b', text, re.IGNORECASE):
        fields["gender"] = "male"
    elif re.search(r'\b(TRANSGENDER)\b', text, re.IGNORECASE):
        fields["gender"] = "other"

    # 4. State Detection
    state = detect_indian_state(text)
    if state:
        fields["state"] = state

    # 5. Name Extraction
    exclude = [
        "government", "india", "bharat", "sarkar", "unique", "identification",
        "authority", "aadhaar", "mera", "helpdesk", "dob", "birth", "male",
        "female", "transgender", "address", "father", "husband", "to"
    ]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name = extract_name_from_lines(lines, exclude)
    if name:
        fields["name"] = name

    return fields

def extract_pan_fields(text: str) -> Dict[str, Any]:
    """Extracts PAN Number, Name, and DOB from PAN card text."""
    fields = {}

    # 1. 10-character alphanumeric PAN format: [A-Z]{5}[0-9]{4}[A-Z]{1}
    pan_match = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b', text)
    if pan_match:
        pan_no = pan_match.group(1)
        fields["id_number"] = pan_no
        fields["masked_id_number"] = f"{pan_no[:2]}XXXXX{pan_no[-3:]}"

    # 2. Date of Birth
    dob, age = parse_dob_and_age(text)
    if dob:
        fields["dob"] = dob
        fields["age"] = age

    # 3. Name Extraction
    exclude = [
        "income", "tax", "department", "govt", "india", "permanent",
        "account", "number", "card", "father", "signature", "date", "birth"
    ]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name = extract_name_from_lines(lines, exclude)
    if name:
        fields["name"] = name

    return fields

def process_document_ocr(image_input: Any) -> OCRScanResponse:
    """
    Full OCR pipeline:
    1. Decodes and preprocesses image
    2. Runs Tesseract OCR with character recognition
    3. Classifies document and parses structured fields
    4. Generates confidence score and pre-filled UserProfileInput
    """
    t0 = time.perf_counter()

    pil_img = decode_image_input(image_input)
    processed_img = preprocess_image(pil_img)

    # Execute Tesseract OCR
    custom_config = r'--oem 3 --psm 6'
    raw_text = pytesseract.image_to_string(processed_img, config=custom_config).strip()

    # Calculate average confidence score using image_to_data
    try:
        data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in data["conf"] if str(c).isdigit() and int(c) >= 0]
        mean_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.75
    except Exception:
        mean_conf = 0.75

    # Document Classification
    doc_type = classify_document(raw_text)

    # Extract fields based on classification
    if doc_type == "PAN":
        extracted = extract_pan_fields(raw_text)
    else:
        extracted = extract_aadhaar_fields(raw_text)
        if not extracted.get("id_number") and doc_type == "Unknown":
            pan_try = extract_pan_fields(raw_text)
            if pan_try.get("id_number"):
                doc_type = "PAN"
                extracted = pan_try

    doc_data = ExtractedDocumentData(
        name=extracted.get("name"),
        dob=extracted.get("dob"),
        age=extracted.get("age"),
        gender=extracted.get("gender"),
        id_number=extracted.get("id_number"),
        masked_id_number=extracted.get("masked_id_number"),
        state=extracted.get("state"),
        residence="both",
        is_bpl=False
    )

    # Adjust confidence based on extracted key fields
    if doc_data.id_number:
        confidence = min(0.98, max(0.80, mean_conf + 0.15))
    elif doc_data.dob or doc_data.name:
        confidence = min(0.85, max(0.60, mean_conf))
    else:
        confidence = max(0.40, min(0.65, mean_conf))

    # Pre-filled UserProfileInput dictionary
    prefilled_profile = {
        "age": doc_data.age or 25,
        "gender": doc_data.gender or "all",
        "state": doc_data.state or "Central",
        "caste_category": "General",
        "annual_income": 150000,
        "residence": doc_data.residence or "both",
        "is_bpl": False,
        "has_disability": False,
        "occupation": None
    }

    elapsed_ms = (time.perf_counter() - t0) * 1000

    return OCRScanResponse(
        document_type=doc_type,
        confidence_score=round(confidence, 2),
        extracted_data=doc_data,
        raw_text=raw_text,
        prefilled_profile=prefilled_profile,
        latency_ms=round(elapsed_ms, 2)
    )
