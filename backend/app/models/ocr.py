from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ExtractedDocumentData(BaseModel):
    name: Optional[str] = Field(None, description="Citizen full name")
    dob: Optional[str] = Field(None, description="Date of birth in DD/MM/YYYY format")
    age: Optional[int] = Field(None, description="Computed age in years")
    gender: Optional[str] = Field(None, description="male, female, or other")
    id_number: Optional[str] = Field(None, description="Full extracted document number")
    masked_id_number: Optional[str] = Field(None, description="Privacy-masked ID number (e.g. XXXX XXXX 1234)")
    state: Optional[str] = Field(None, description="Detected state of residence")
    residence: Optional[str] = Field("both", description="rural, urban, or both")
    is_bpl: Optional[bool] = Field(False, description="Detected BPL indicator")

class OCRScanResponse(BaseModel):
    document_type: str = Field(..., description="'Aadhaar', 'PAN', 'Ration Card', or 'Unknown'")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    extracted_data: ExtractedDocumentData
    raw_text: str = Field(..., description="Raw text extracted by OCR engine")
    prefilled_profile: Dict[str, Any] = Field(..., description="Pre-filled profile dictionary ready for eligibility matcher")
    latency_ms: float = Field(..., description="Processing time in milliseconds")

class CameraFrameScanRequest(BaseModel):
    image_base64: str = Field(..., min_length=10, description="Base64 encoded image string (data:image/jpeg;base64,... or raw base64)")

class SupportedDocInfo(BaseModel):
    doc_type: str
    description: str
    extractable_fields: List[str]
