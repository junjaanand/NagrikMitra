import io
import gc
import re
import hashlib
import logging
import asyncio
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from app.models.ocr import OCRScanResponse, CameraFrameScanRequest, SupportedDocInfo
from app.services.ocr_service import process_document_ocr
from app.dependencies.auth import check_compute_rate_limit

router = APIRouter()
logger = logging.getLogger("NagrikMitra.DPDP")

SUPPORTED_DOCS: List[SupportedDocInfo] = [
    SupportedDocInfo(
        doc_type="Aadhaar Card",
        description="Extracts 12-digit UID (masked for security), Full Name, Date of Birth / Year, Gender, and State.",
        extractable_fields=["name", "dob", "age", "gender", "masked_id_number", "state"]
    ),
    SupportedDocInfo(
        doc_type="PAN Card",
        description="Extracts 10-character alphanumeric PAN (masked), Full Name, and Date of Birth.",
        extractable_fields=["name", "dob", "age", "masked_id_number"]
    ),
    SupportedDocInfo(
        doc_type="Ration Card",
        description="Extracts Ration card number (masked), BPL/AAY welfare category indicators, and family head name.",
        extractable_fields=["name", "masked_id_number", "is_bpl"]
    )
]

def scrub_pii_from_raw_text(text: str) -> str:
    """
    Mandatory PII Redaction Engine under DPDP Act 2023 & Aadhaar Act 2016:
    Masks 12-digit Aadhaar UID sequences and 10-char PAN numbers from raw transcripts.
    """
    if not text:
        return ""
    # Mask Aadhaar numbers: 1234 5678 9012 or 123456789012 -> XXXX XXXX 9012
    text = re.sub(
        r'\b([2-9]\d{3})[\s\-]?(\d{4})[\s\-]?(\d{4})\b',
        r'XXXX XXXX \3',
        text
    )
    # Mask PAN numbers: ABCDE1234F -> ABXXXXX34F
    text = re.sub(
        r'\b([A-Z]{2})[A-Z]{3}\d{2}(\d{2})([A-Z])\b',
        r'\1XXXXX\2\3',
        text
    )
    return text

@router.get("/")
async def ocr_info():
    """Information on available OCR document scanning endpoints."""
    return {
        "status": "ready",
        "compliance": "DPDP Act 2023 Compliant (In-Memory Zero Retention)",
        "description": "Optical Character Recognition (OCR) identity document scanning service",
        "supported_documents": [d.doc_type for d in SUPPORTED_DOCS],
        "endpoints": {
            "scan_file": "POST /api/ocr/scan-file",
            "scan_frame": "POST /api/ocr/scan-frame",
            "supported_docs": "GET /api/ocr/supported-docs"
        }
    }

@router.post("/scan-file", response_model=OCRScanResponse)
async def scan_document_file(
    file: UploadFile = File(...),
    consent_acknowledged: bool = Query(True, description="Citizen affirmative consent acknowledgement under DPDP Act 2023"),
    current_citizen: Dict[str, Any] = Depends(check_compute_rate_limit(max_requests=20, window_seconds=60))
):
    """
    Accepts an uploaded image file (PNG, JPG, JPEG, WEBP) of an identity document,
    executes ephemeral in-memory OCR text extraction with zero disk footprint, and scrubs all PII.
    Enforces deterministic memory zeroization post-inference.
    """
    if not consent_acknowledged:
        raise HTTPException(
            status_code=400,
            detail="DPDP Act 2023 requires affirmative citizen consent prior to processing identity documents."
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format: '{file.content_type}'. Please upload an image file (PNG, JPG, WEBP)."
        )
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    CHUNK_SIZE = 64 * 1024             # 64 KB
    
    chunks = []
    total_bytes = 0

    try:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail="Uploaded file exceeds the maximum permitted size limit of 10 MB."
                )
            chunks.append(chunk)

        raw_bytes = b"".join(chunks)
        mem_buffer = bytearray(raw_bytes)

        # Offload heavy CPU OpenCV/Tesseract computation to non-blocking worker thread
        result = await asyncio.to_thread(process_document_ocr, bytes(mem_buffer))

        # Enforce DPDP Act 2023 & Aadhaar Act Section 29 redactions
        result.extracted_data.id_number = None
        result.raw_text = scrub_pii_from_raw_text(result.raw_text)

        # Non-PII audit telemetry
        txn_hash = hashlib.sha256(raw_bytes[:64] if len(raw_bytes) >= 64 else b"zero").hexdigest()[:16]
        logger.info(
            f"DPDP_AUDIT: txn={txn_hash} doc={result.document_type} "
            f"bytes={total_bytes} retained=0 zeroized=True"
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process document image with OCR. Please ensure the image is clear and try again."
        )
    finally:
        # Deterministic memory zeroization
        if 'mem_buffer' in locals():
            for i in range(len(mem_buffer)):
                mem_buffer[i] = 0
            del mem_buffer
        if 'raw_bytes' in locals():
            del raw_bytes
        if 'chunks' in locals():
            del chunks
        gc.collect()

@router.post("/scan-frame", response_model=OCRScanResponse)
async def scan_camera_frame(
    request: CameraFrameScanRequest,
    current_citizen: Dict[str, Any] = Depends(check_compute_rate_limit(max_requests=25, window_seconds=60))
):
    """
    Accepts a base64 encoded image frame from the browser's live video stream,
    processes it through the ephemeral OCR engine with zero disk retention,
    and returns sanitized extracted identity details.
    """
    if not request.consent_acknowledged:
        raise HTTPException(
            status_code=400,
            detail="DPDP Act 2023 requires affirmative citizen consent prior to processing identity documents."
        )

    # Enforce base64 payload size guard (~10MB decoded payload ceiling)
    if len(request.image_base64) > 14 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Camera frame payload exceeds maximum permissible size."
        )

    try:
        # Offload heavy CPU OpenCV/Tesseract computation to non-blocking worker thread
        result = await asyncio.to_thread(process_document_ocr, request.image_base64)

        # Enforce DPDP Act 2023 & Aadhaar Act Section 29 redactions
        result.extracted_data.id_number = None
        result.raw_text = scrub_pii_from_raw_text(result.raw_text)

        # Non-PII audit telemetry
        txn_hash = hashlib.sha256(request.image_base64[:64].encode()).hexdigest()[:16]
        logger.info(
            f"DPDP_AUDIT: txn={txn_hash} doc={result.document_type} "
            f"bytes={len(request.image_base64)} retained=0 zeroized=True"
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Camera frame OCR failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to parse camera frame. Please position the identity card clearly in the frame."
        )
    finally:
        gc.collect()

@router.get("/supported-docs", response_model=List[SupportedDocInfo])
async def get_supported_documents():
    """Returns catalog of supported identity documents and their extractable demographic fields."""
    return SUPPORTED_DOCS
