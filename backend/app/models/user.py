from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.scheme import SchemeListItem

class UserProfileInput(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Citizen age in years")
    gender: str = Field(..., description="male, female, or other/transgender")
    state: str = Field(..., description="State or Union Territory of residence")
    caste_category: str = Field(default="General", description="General, OBC, SC, or ST")
    annual_income: int = Field(default=0, ge=0, description="Annual family income in INR")
    residence: str = Field(default="both", description="rural, urban, or both")
    is_bpl: bool = Field(default=False, description="Whether Below Poverty Line")
    has_disability: bool = Field(default=False, description="Whether person has disability")
    occupation: Optional[str] = Field(default=None, description="Occupation (e.g. farmer, student, artisan)")

class MatchedSchemeResult(BaseModel):
    slug: str
    name: str
    state: str
    category: str
    benefits: Optional[str] = None
    official_url: Optional[str] = None
    apply_url: Optional[str] = None
    documents_required: Optional[str] = None
    relevance_score: float = 1.0
    match_reasons: List[str] = []
    estimated_benefit_amount: Optional[str] = None
    application_mode: Optional[str] = "online"
    lifecycle_status: Optional[str] = "active"

class EligibilityMatchResponse(BaseModel):
    total_matched: int
    matched_schemes: List[MatchedSchemeResult]
    category_breakdown: Dict[str, int]
    potential_benefit_summary: str
    user_profile: UserProfileInput
