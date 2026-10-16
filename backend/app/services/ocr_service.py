import os
import re
import io
import time
import base64
import logging
from typing import Dict, Any, Tuple, Optional, List
from PIL import Image, ImageEnhance
import numpy as np

# Prevent decompression bomb attacks
Image.MAX_IMAGE_PIXELS = 25_000_000

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

import sys
if 'pandas' not in sys.modules:
    sys.modules['pandas'] = None
import pytesseract
from app.models.ocr import ExtractedDocumentData, OCRScanResponse

logger = logging.getLogger("NagrikMitra.OCR")

# Locate Tesseract binary on Windows / Linux
POSSIBLE_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\VARUN\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
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

# Official Indian Postal PIN Code 2-digit Prefix to State Mapping
PIN_STATE_PREFIXES = {
    '11': 'Delhi',
    '12': 'Haryana', '13': 'Haryana',
    '14': 'Punjab', '15': 'Punjab',
    '16': 'Chandigarh',
    '17': 'Himachal Pradesh',
    '18': 'Jammu and Kashmir', '19': 'Jammu and Kashmir',
    '20': 'Uttar Pradesh', '21': 'Uttar Pradesh', '22': 'Uttar Pradesh',
    '23': 'Uttar Pradesh', '24': 'Uttar Pradesh', '25': 'Uttar Pradesh',
    '26': 'Uttar Pradesh', '27': 'Uttar Pradesh', '28': 'Uttar Pradesh',
    '30': 'Rajasthan', '31': 'Rajasthan', '32': 'Rajasthan',
    '33': 'Rajasthan', '34': 'Rajasthan',
    '36': 'Gujarat', '37': 'Gujarat', '38': 'Gujarat', '39': 'Gujarat',
    '40': 'Maharashtra', '41': 'Maharashtra', '42': 'Maharashtra',
    '43': 'Maharashtra', '44': 'Maharashtra',
    '45': 'Madhya Pradesh', '46': 'Madhya Pradesh', '47': 'Madhya Pradesh',
    '48': 'Madhya Pradesh', '49': 'Chhattisgarh',
    '50': 'Telangana',
    '51': 'Andhra Pradesh', '52': 'Andhra Pradesh', '53': 'Andhra Pradesh',
    '56': 'Karnataka', '57': 'Karnataka', '58': 'Karnataka', '59': 'Karnataka',
    '60': 'Tamil Nadu', '61': 'Tamil Nadu', '62': 'Tamil Nadu',
    '63': 'Tamil Nadu', '64': 'Tamil Nadu',
    '67': 'Kerala', '68': 'Kerala', '69': 'Kerala',
    '70': 'West Bengal', '71': 'West Bengal', '72': 'West Bengal',
    '73': 'West Bengal', '74': 'West Bengal',
    '75': 'Odisha', '76': 'Odisha', '77': 'Odisha',
    '78': 'Assam', '79': 'Assam',
    '80': 'Bihar', '81': 'Bihar', '82': 'Bihar',
    '83': 'Jharkhand', '84': 'Bihar', '85': 'Bihar',
}

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

def deskew_image(cv_img: np.ndarray) -> np.ndarray:
    """
    Detects slight tilt/skew angle in document photo and corrects orientation.
    """
    try:
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY) if len(cv_img.shape) == 3 else cv_img
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
        if lines is not None:
            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if x2 != x1:
                    angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                    if abs(angle) < 45:
                        angles.append(angle)
            if angles:
                median_angle = float(np.median(angles))
                if abs(median_angle) > 0.5:
                    (h, w) = cv_img.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                    cv_img = cv2.warpAffine(cv_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    except Exception as e:
        logger.debug(f"Deskew skipped: {e}")
    return cv_img

def preprocess_image_variants(pil_img: Image.Image) -> Tuple[Image.Image, Image.Image]:
    """
    Applies high-fidelity contrast enhancement, shadow removal, and adaptive binarization.
    Returns:
    1. Grayscale CLAHE Image (ideal for Tesseract LSTM page segmentation)
    2. Adaptive Gaussian Thresholded Image (ideal for sparse number and fine print extraction)
    """
    # 1. Scale image to optimal DPI dimension (1400px minimum width)
    target_width = 1400
    if pil_img.width < target_width:
        ratio = target_width / float(pil_img.width)
        new_height = int(float(pil_img.height) * ratio)
        pil_img = pil_img.resize((target_width, new_height), Image.Resampling.LANCZOS)

    if HAS_OPENCV:
        try:
            cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            cv_img = deskew_image(cv_img)

            # Convert to LAB color space to apply CLAHE to Luminance channel (flattens shadows & flash glare)
            lab = cv2.cvtColor(cv_img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.8, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            enhanced_bgr = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)

            # Pass 1: Denoised Grayscale (Preserves subpixel text gradients for Tesseract neural net)
            gray = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2GRAY)
            denoised_gray = cv2.bilateralFilter(gray, 7, 50, 50)

            # Pass 2: Adaptive Gaussian Thresholding (Handles variable lighting across card)
            adaptive_thresh = cv2.adaptiveThreshold(
                denoised_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 23, 9
            )

            return Image.fromarray(denoised_gray), Image.fromarray(adaptive_thresh)
        except Exception as e:
            logger.warning(f"OpenCV enhancement error: {e}. Using PIL fallback.")

    # PIL Fallback
    gray_pil = pil_img.convert("L")
    enhancer = ImageEnhance.Contrast(gray_pil)
    contrast_pil = enhancer.enhance(1.8)
    binarized_pil = contrast_pil.point(lambda p: 255 if p > 135 else 0)
    return contrast_pil, binarized_pil

def normalize_digit_confusions(s: str) -> str:
    """Corrects common OCR character confusions in numeric blocks."""
    char_map = {
        'O': '0', 'o': '0', 'D': '0', 'Q': '0',
        'I': '1', 'l': '1', '|': '1', '!': '1', 'i': '1', 'T': '1',
        'Z': '2', 'z': '2',
        'S': '5', 's': '5',
        'B': '8'
    }
    return ''.join(char_map.get(c, c) for c in s)

def classify_document(text: str) -> str:
    """Classifies document type based on structural keywords."""
    lower = text.lower()

    if re.search(r'\b[A-Za-z]{5}[0-9OIl|!SsBb]{4}[A-Za-z]{1}\b', text) or "income tax" in lower or "permanent account" in lower:
        return "PAN"

    if (
        "unique identification" in lower
        or "aadhaar" in lower
        or "मेरा आधार" in lower
        or "uidai" in lower
        or re.search(r'\b[2-9]\d{3}\s\d{4}\s\d{4}\b', text)
        or "government of india" in lower
        or "भारत सरकार" in lower
    ):
        return "Aadhaar"

    if "ration" in lower or "food & civil supplies" in lower or "fair price" in lower or "antyodaya" in lower or "nfsa" in lower:
        return "Ration Card"

    return "Aadhaar" if any(k in lower for k in ("dob", "birth", "yob", "male", "female", "address", "पता")) else "Unknown"

def parse_dob_and_age(text: str) -> Tuple[Optional[str], Optional[int]]:
    """
    High-resilience Date of Birth and Age parser.
    Handles:
    - Delimiters: '/', '-', '.', ':', ';', spaces, or compressed digits (e.g. 15081986, 0804. 1995)
    - Anchors: DOB, D.O.B, D0B, 008, OOB, OB, Birth, Date of Birth, जन्म तिथि, जन्म वर्ष, Year of Birth, YOB
    - Formats: DD/MM/YYYY, YYYY/MM/DD, DD-Month-YYYY
    - Year of Birth (YOB) fallback
    """
    # 1. Anchored DOB matching (Highest Confidence)
    anchor_patterns = [
        r'(?:dob|d\.o\.b|d0b|008|oob|ob|birth|जन्म\s*तिथि|date\s*of\s*birth)\s*[:.\-]?\s*(\d{1,2})[/\-.:\s]+(\d{1,2}|[a-zA-Z]{3,9})[/\-.:\s]+(\d{4})',
        r'(?:dob|d\.o\.b|d0b|008|oob|ob|birth|जन्म\s*तिथि|date\s*of\s*birth)\s*[:.\-]?\s*(\d{2})(\d{2})[.\s]+(\d{4})',
        r'(?:dob|d\.o\.b|d0b|008|oob|ob|birth|जन्म\s*तिथि|date\s*of\s*birth)\s*[:.\-]?\s*(\d{4})[/\-.:\s]+(\d{1,2})[/\-.:\s]+(\d{1,2})',
    ]

    for pat in anchor_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            groups = m.groups()
            if len(groups) == 3:
                # Check if first group is 4-digit year (YYYY-MM-DD)
                if len(groups[0]) == 4 and 1920 <= int(groups[0]) <= 2026:
                    y, mth, d = int(groups[0]), int(groups[1]), int(groups[2])
                else:
                    d, mth_raw, y = int(groups[0]), groups[1], int(groups[2])
                    mth = int(mth_raw) if mth_raw.isdigit() else 1
                
                if 1 <= d <= 31 and 1 <= mth <= 12 and 1920 <= y <= 2026:
                    age = max(1, 2026 - y)
                    return f"{d:02d}/{mth:02d}/{y}", age

    # 2. General Date Regex (DD/MM/YYYY with any separator including colons/dots)
    gen_matches = re.findall(r'\b(\d{1,2})[/\-.:\s]+(\d{1,2})[/\-.:\s]+(19\d{2}|20\d{2})\b', text)
    for d_str, m_str, y_str in gen_matches:
        d, m, y = int(d_str), int(m_str), int(y_str)
        if 1 <= d <= 31 and 1 <= m <= 12 and 1920 <= y <= 2026:
            age = max(1, 2026 - y)
            return f"{d:02d}/{m:02d}/{y}", age

    # 3. Compressed Date Regex (e.g. 0804. 1995 or 15081990)
    comp_matches = re.findall(r'\b(\d{2})(\d{2})[.\s]*(19\d{2}|20\d{2})\b', text)
    for d_str, m_str, y_str in comp_matches:
        d, m, y = int(d_str), int(m_str), int(y_str)
        if 1 <= d <= 31 and 1 <= m <= 12 and 1920 <= y <= 2026:
            age = max(1, 2026 - y)
            return f"{d:02d}/{m:02d}/{y}", age

    # 4. Year of Birth (YOB) Fallback
    yob_match = re.search(r'(?:year\s*of\s*birth|yob|जन्म\s*वर्ष|year)[:\s]*(\d{4})\b', text, re.IGNORECASE)
    if yob_match:
        year = int(yob_match.group(1))
        if 1920 <= year <= 2026:
            return f"01/01/{year}", max(1, 2026 - year)

    # 5. Standalone 4-digit Year in a DOB-associated line
    for line in text.split('\n'):
        if any(k in line.lower() for k in ('dob', 'birth', 'जन्म', 'yob', '008', 'ob')):
            yr_match = re.search(r'\b(19[3-9]\d|20[0-2]\d)\b', line)
            if yr_match:
                year = int(yr_match.group(1))
                return f"01/01/{year}", max(1, 2026 - year)

    return None, None

def detect_indian_state(text: str) -> Optional[str]:
    """Detects Indian state via exact match, fuzzy matching, and 6-digit postal PIN code lookup."""
    lower = text.lower()

    # 1. Exact match across 36 states/UTs
    for st in INDIAN_STATES:
        if re.search(r'\b' + re.escape(st.lower()) + r'\b', lower):
            return st

    # 2. 6-digit Postal PIN Code Intelligence
    pin_matches = re.findall(r'\b([1-9]\d{5})\b', text)
    for pin in pin_matches:
        prefix = pin[:2]
        if prefix in PIN_STATE_PREFIXES:
            return PIN_STATE_PREFIXES[prefix]

    # 3. Fuzzy match for compound state names (e.g. "Uttar Pradesh", "West Bengal")
    for st in INDIAN_STATES:
        words = st.lower().split()
        if len(words) >= 2 and words[-1] in ("pradesh", "bengal", "kashmir", "islands", "nadu", "diu"):
            if words[-1] in lower and words[0][:4] in lower:
                return st

    return None

def extract_citizen_name(text: str, doc_type: str = "Aadhaar") -> Optional[str]:
    """
    Intelligently extracts the citizen's full name by leveraging Indian ID spatial anchors:
    - On Aadhaar: Name appears directly preceding DOB / Date of Birth.
    - On PAN: Name appears directly below 'Permanent Account Number Card' and above Father's Name / DOB.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return None

    exclude_keywords = {
        "government", "india", "bharat", "sarkar", "unique", "identification",
        "authority", "aadhaar", "mera", "helpdesk", "income", "tax", "department",
        "permanent", "account", "number", "card", "father", "husband", "signature",
        "date", "birth", "male", "female", "transgender", "address", "to", "enrollment",
        "enrolment", "download", "issue", "valid", "republic", "electronic"
    }

    # 1. Spatial Anchor: Line directly preceding DOB line
    dob_line_idx = -1
    for idx, line in enumerate(lines):
        if re.search(r'(?:dob|d\.o\.b|d0b|008|oob|ob|birth|जन्म|year\s*of\s*birth)', line, re.IGNORECASE):
            dob_line_idx = idx
            break

    if dob_line_idx > 0:
        for offset in [1, 2, 3]:
            cand_idx = dob_line_idx - offset
            if cand_idx >= 0:
                cand_line = lines[cand_idx]
                words = re.findall(r'[A-Za-z]+', cand_line)
                if 2 <= len(words) <= 4:
                    if not any(w.lower() in exclude_keywords for w in words):
                        if all(len(w) >= 2 for w in words):
                            return " ".join(w.capitalize() for w in words)

    # 2. General Candidate Scoring (Title Case & length heuristic)
    candidates = []
    for line in lines:
        words = re.findall(r'[A-Za-z]+', line)
        if 2 <= len(words) <= 4:
            if any(w.lower() in exclude_keywords for w in words):
                continue
            if all(len(w) >= 2 for w in words):
                title_score = sum(1 for w in words if w.istitle() or w.isupper())
                candidates.append((title_score, " ".join(w.capitalize() for w in words)))

    if candidates:
        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1]

    return None

def extract_aadhaar_fields(text: str) -> Dict[str, Any]:
    """Extracts UID (with digit normalization), Name, DOB, Gender, and State from Aadhaar card."""
    fields = {}

    # 1. 12-digit UID pattern with OCR digit recovery (e.g. O -> 0, I -> 1)
    uid_found = False
    candidate_blocks = re.findall(r'[2-9][0-9OIl|!SsBb]{3}[\s\-]?[0-9OIl|!SsBb]{4}[\s\-]?[0-9OIl|!SsBb]{4}', text)
    for block in candidate_blocks:
        norm = normalize_digit_confusions(block.replace(" ", "").replace("-", ""))
        if len(norm) == 12 and norm.isdigit() and norm[0] in '23456789':
            fields["id_number"] = f"{norm[:4]} {norm[4:8]} {norm[8:]}"
            fields["masked_id_number"] = f"XXXX XXXX {norm[8:]}"
            uid_found = True
            break

    if not uid_found:
        # Fallback to pure 12-digit string
        match = re.search(r'\b([2-9]\d{11})\b', text)
        if match:
            raw_uid = match.group(1)
            fields["id_number"] = f"{raw_uid[:4]} {raw_uid[4:8]} {raw_uid[8:]}"
            fields["masked_id_number"] = f"XXXX XXXX {raw_uid[8:]}"

    # 2. Date of Birth and Age
    dob, age = parse_dob_and_age(text)
    if dob:
        fields["dob"] = dob
        fields["age"] = age

    # 3. Gender
    if re.search(r'\b(FEMALE|WOMAN|महिला|स्त्री|/ F /|/F/)\b', text, re.IGNORECASE):
        fields["gender"] = "female"
    elif re.search(r'\b(MALE|MAN|पुरुष|/ M /|/M/)\b', text, re.IGNORECASE):
        fields["gender"] = "male"
    elif re.search(r'\b(TRANSGENDER)\b', text, re.IGNORECASE):
        fields["gender"] = "other"

    # 4. State Detection (Direct text + Postal PIN Code)
    state = detect_indian_state(text)
    if state:
        fields["state"] = state

    # 5. Name Extraction
    name = extract_citizen_name(text, doc_type="Aadhaar")
    if name:
        fields["name"] = name

    return fields

def extract_pan_fields(text: str) -> Dict[str, Any]:
    """Extracts PAN Number (with alphanumeric recovery), Name, and DOB from PAN card."""
    fields = {}

    # 1. 10-character PAN pattern: [A-Z]{5}[0-9]{4}[A-Z]{1}
    pan_candidates = re.findall(r'\b[A-Za-z0-9]{5}\s?[A-Za-z0-9]{4}\s?[A-Za-z0-9]{1}\b', text)
    for cand in pan_candidates:
        s = re.sub(r'[^A-Za-z0-9]', '', cand).upper()
        if len(s) == 10:
            # Normalize letter/number confusion in 10-char candidate
            digit_to_letter = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B'}
            letter_to_digit = {'O': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'B': '8'}
            prefix = ''.join(digit_to_letter.get(c, c) for c in s[:5])
            middle = ''.join(letter_to_digit.get(c, c) for c in s[5:9])
            suffix = digit_to_letter.get(s[9], s[9])
            pan_norm = prefix + middle + suffix
            if re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', pan_norm):
                fields["id_number"] = pan_norm
                fields["masked_id_number"] = f"{pan_norm[:2]}XXXXX{pan_norm[-3:]}"
                break

    # 2. Date of Birth and Age
    dob, age = parse_dob_and_age(text)
    if dob:
        fields["dob"] = dob
        fields["age"] = age

    # 3. Name Extraction
    name = extract_citizen_name(text, doc_type="PAN")
    if name:
        fields["name"] = name

    # 4. State Detection (if available in PAN context)
    state = detect_indian_state(text)
    if state:
        fields["state"] = state

    return fields

def extract_ration_card_fields(text: str) -> Dict[str, Any]:
    """Extracts Ration Card details, BPL/AAY flags, and state."""
    fields = {"is_bpl": False}
    lower = text.lower()

    if any(k in lower for k in ("bpl", "aay", "antyodaya", "phh", "below poverty", "priority household")):
        fields["is_bpl"] = True

    # Ration card number pattern (typically 10-14 alphanumeric/digits)
    rc_match = re.search(r'\b([A-Z]{2,4}\d{8,12}|\d{10,14})\b', text)
    if rc_match:
        rc_num = rc_match.group(1)
        fields["id_number"] = rc_num
        fields["masked_id_number"] = f"{rc_num[:3]}XXXX{rc_num[-3:]}"

    dob, age = parse_dob_and_age(text)
    if dob:
        fields["dob"] = dob
        fields["age"] = age

    name = extract_citizen_name(text, doc_type="Ration Card")
    if name:
        fields["name"] = name

    state = detect_indian_state(text)
    if state:
        fields["state"] = state

    return fields

def process_document_ocr(image_input: Any) -> OCRScanResponse:
    """
    Multi-Pass Neural OCR Engine:
    1. Decodes and scales input image.
    2. Generates dual image representations:
       - Enhanced Grayscale with LAB-CLAHE (preserves font subtleties for layout parsing).
       - Adaptive Gaussian Binarized image (extracts thin numbers and small text).
    3. Executes multi-pass Tesseract OCR across both representations (PSM 3 + PSM 11).
    4. Merges extracted text streams and performs structured Indian ID extraction.
    5. Computes dynamic confidence score and returns ready-to-use citizen eligibility profile.
    """
    t0 = time.perf_counter()

    pil_img = decode_image_input(image_input)
    gray_img, adaptive_img = preprocess_image_variants(pil_img)

    # Pass 1: Neural LSTM with Page Segmentation Mode 3 (Fully automatic segmentation)
    # Allows reading multi-column layouts, names, headings, and dates naturally
    config_pass1 = r'--oem 3 --psm 3'
    raw_pass1 = pytesseract.image_to_string(gray_img, config=config_pass1).strip()

    # Pass 2: Sparse Text Finder with Mode 11 on Adaptive Threshold
    # Discovers isolated numbers (12-digit Aadhaar UID, PAN, PIN codes) that Pass 1 missed
    config_pass2 = r'--oem 3 --psm 11'
    raw_pass2 = pytesseract.image_to_string(adaptive_img, config=config_pass2).strip()

    # Combined text stream ensures no isolated field is omitted
    combined_raw = f"{raw_pass1}\n{raw_pass2}".strip()

    # Calculate average confidence score using image_to_data
    try:
        data = pytesseract.image_to_data(gray_img, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in data["conf"] if str(c).isdigit() and int(c) >= 0]
        mean_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.80
    except Exception:
        mean_conf = 0.80

    # Classify Document
    doc_type = classify_document(combined_raw)

    # Extract Fields according to classification
    if doc_type == "PAN":
        extracted = extract_pan_fields(combined_raw)
    elif doc_type == "Ration Card":
        extracted = extract_ration_card_fields(combined_raw)
    else:
        # Default to Aadhaar extractor
        extracted = extract_aadhaar_fields(combined_raw)
        # Cross-validation fallback: check if PAN was missed
        if not extracted.get("id_number") and doc_type == "Unknown":
            pan_try = extract_pan_fields(combined_raw)
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
        is_bpl=extracted.get("is_bpl", False)
    )

    # Dynamic confidence scoring based on completeness of identity fields
    field_count = sum(1 for v in [doc_data.name, doc_data.dob, doc_data.gender, doc_data.id_number, doc_data.state] if v)
    if field_count >= 4:
        confidence = min(0.99, max(0.90, mean_conf + 0.15))
    elif field_count >= 2:
        confidence = min(0.88, max(0.75, mean_conf + 0.05))
    else:
        confidence = max(0.50, min(0.70, mean_conf))

    # Pre-filled UserProfileInput dictionary
    prefilled_profile = {
        "age": doc_data.age or 28,
        "gender": doc_data.gender or "all",
        "state": doc_data.state or "Central",
        "caste_category": "General",
        "annual_income": 150000,
        "residence": doc_data.residence or "both",
        "is_bpl": doc_data.is_bpl or False,
        "has_disability": False,
        "occupation": None
    }

    elapsed_ms = (time.perf_counter() - t0) * 1000

    return OCRScanResponse(
        document_type=doc_type,
        confidence_score=round(confidence, 2),
        extracted_data=doc_data,
        raw_text=combined_raw,
        prefilled_profile=prefilled_profile,
        latency_ms=round(elapsed_ms, 2)
    )
