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
    ration_card_color: Optional[str] = Field(default=None, description="yellow, orange, white, or none")
    is_widow: bool = Field(default=False, description="Whether citizen is a widow or single mother")

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
    
    # Phase 04: Two-Stage Funnel Attributes
    eligibility_tier: int = 1  # 1 = 100% Direct Match, 2 = Near-Match / Action Required
    missing_criteria: List[str] = []
    micro_conditions: List[Dict[str, Any]] = []
    actionable_guidance: Optional[str] = None
    
    # Phase 05: Umbrella Successor Attributes
    successor_slug: Optional[str] = None
    successor_name: Optional[str] = None

class EligibilityMatchResponse(BaseModel):
    total_matched: int
    matched_schemes: List[MatchedSchemeResult]
    category_breakdown: Dict[str, int]
    potential_benefit_summary: str
    user_profile: UserProfileInput
