import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from app.models.ocr import OCRScanResponse, CameraFrameScanRequest, SupportedDocInfo
from app.services.ocr_service import process_document_ocr

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
async def scan_document_file(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file (PNG, JPG, JPEG, WEBP) of an identity document,
    executes OCR text extraction, and returns structured attributes with an auto-filled eligibility profile.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format: '{file.content_type}'. Please upload an image file (PNG, JPG, WEBP)."
        )
    
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 10 MB.")
            
        result = process_document_ocr(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failure: {str(e)}")

@router.post("/scan-frame", response_model=OCRScanResponse)
async def scan_camera_frame(request: CameraFrameScanRequest):
    """
    Accepts a base64 encoded image frame from the browser's live video stream (WebRTC getUserMedia),
    processes it through the OCR engine, and returns extracted identity details.
    """
    try:
        result = process_document_ocr(request.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Camera frame OCR error: {str(e)}")

@router.get("/supported-docs", response_model=List[SupportedDocInfo])
async def get_supported_documents():
    """Returns catalog of supported identity documents and their extractable demographic fields."""
    return SUPPORTED_DOCS
