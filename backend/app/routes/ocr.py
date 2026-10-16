import io
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from typing import List, Dict, Any
from app.models.ocr import OCRScanResponse, CameraFrameScanRequest, SupportedDocInfo
from app.services.ocr_service import process_document_ocr
from app.dependencies.auth import check_compute_rate_limit

router = APIRouter()

SUPPORTED_DOCS: List[SupportedDocInfo] = [
    SupportedDocInfo(
        doc_type="Aadhaar Card",
        description="Extracts 12-digit UID (masked for security), Full Name, Date of Birth / Year, Gender, and State.",
        extractable_fields=["name", "dob", "age", "gender", "id_number", "masked_id_number", "state"]
    ),
    SupportedDocInfo(
        doc_type="PAN Card",
        description="Extracts 10-character alphanumeric PAN, Full Name, and Date of Birth.",
        extractable_fields=["name", "dob", "age", "id_number", "masked_id_number"]
    ),
    SupportedDocInfo(
        doc_type="Ration Card",
        description="Extracts Ration card number, BPL/AAY welfare category indicators, and family head name.",
        extractable_fields=["name", "id_number", "is_bpl"]
    )
]

@router.get("/")
async def ocr_info():
    """Information on available OCR document scanning endpoints."""
    return {
        "status": "ready",
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
    current_citizen: Dict[str, Any] = Depends(check_compute_rate_limit(max_requests=20, window_seconds=60))
):
    """
    Accepts an uploaded image file (PNG, JPG, JPEG, WEBP) of an identity document,
    executes OCR text extraction, and returns structured attributes with an auto-filled eligibility profile.
    Protected by CERT-In authentication and compute quota rate limiting.
    """
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

        contents = b"".join(chunks)
        result = process_document_ocr(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to process document image with OCR. Please ensure the image is clear and try again."
        )

@router.post("/scan-frame", response_model=OCRScanResponse)
async def scan_camera_frame(
    request: CameraFrameScanRequest,
    current_citizen: Dict[str, Any] = Depends(check_compute_rate_limit(max_requests=25, window_seconds=60))
):
    """
    Accepts a base64 encoded image frame from the browser's live video stream (WebRTC getUserMedia),
    processes it through the OCR engine, and returns extracted identity details.
    Protected by CERT-In authentication and compute quota rate limiting.
    """
    # Enforce base64 payload size guard (~10MB decoded payload ceiling)
    if len(request.image_base64) > 14 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Camera frame payload exceeds maximum permissible size."
        )

    try:
        result = process_document_ocr(request.image_base64)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unable to parse camera frame. Please position the identity card clearly in the frame."
        )

@router.get("/supported-docs", response_model=List[SupportedDocInfo])
async def get_supported_documents():
    """Returns catalog of supported identity documents and their extractable demographic fields."""
    return SUPPORTED_DOCS
