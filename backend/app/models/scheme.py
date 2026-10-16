from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SchemeBase(BaseModel):
    slug: str
    name: Optional[str] = None
    description: Optional[str] = None
    ministry: Optional[str] = None
    department: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    beneficiary_type: Optional[str] = None
    benefits: Optional[str] = None
    eligibility_text: Optional[str] = None
    application_process: Optional[str] = None
    documents_required: Optional[str] = None
    apply_url: Optional[str] = None
    official_url: Optional[str] = None
    eligibility_age_min: Optional[int] = None
    eligibility_age_max: Optional[int] = None
    eligibility_gender: Optional[str] = "all"
    eligibility_caste: Optional[str] = "[]"
    eligibility_income_max: Optional[int] = None
    eligibility_residence: Optional[str] = "both"
    eligibility_state: Optional[str] = '["All"]'
    eligibility_disability: Optional[bool] = False
    eligibility_bpl: Optional[bool] = False
    scraped_at: Optional[str] = None
    application_mode: Optional[str] = "online"
    lifecycle_status: Optional[str] = "active"
    link_status: Optional[str] = "verified"

class SchemeDetail(SchemeBase):
    caste_list: List[str] = []
    state_list: List[str] = []
    parsed_benefits: Optional[str] = None
    estimated_benefit_amount: Optional[str] = None

class SchemeListItem(BaseModel):
    slug: str
    name: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    benefits: Optional[str] = None
    eligibility_gender: Optional[str] = None
    eligibility_income_max: Optional[int] = None
    eligibility_bpl: Optional[bool] = False
    eligibility_disability: Optional[bool] = False
    application_mode: Optional[str] = "online"
    lifecycle_status: Optional[str] = "active"

class PaginatedSchemesResponse(BaseModel):
    items: List[SchemeListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class CategoryStat(BaseModel):
    category: str
    count: int

class StateStat(BaseModel):
    state: str
    count: int

class GlobalStats(BaseModel):
    total_schemes: int
    central_schemes: int
    state_schemes: int
    categories_count: int
    states_count: int
    women_schemes_count: int
    bpl_schemes_count: int
    disability_schemes_count: int

class CategoryDistributionItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: Optional[str] = None

class JurisdictionDistributionItem(BaseModel):
    name: str
    count: int
    fill: Optional[str] = None

class BenefitTypeDistributionItem(BaseModel):
    type: str
    count: int
    percentage: float
    description: str

class FinancialBracketItem(BaseModel):
    bracket: str
    count: int
    label: str

class AnalyticsResponse(BaseModel):
    total_schemes: int
    category_distribution: List[CategoryDistributionItem]
    jurisdiction_distribution: List[JurisdictionDistributionItem]
    benefit_types: List[BenefitTypeDistributionItem]
    financial_brackets: List[FinancialBracketItem]
    target_demographics: Dict[str, int]
    estimated_total_subsidy_pool: str

class SchemeCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=250, description="Full statutory name of the scheme")
    slug: Optional[str] = Field(None, description="Unique slug identifier (auto-generated if omitted)")
    ministry: Optional[str] = Field("Government of India", description="Nodal Ministry or Department")
    department: Optional[str] = None
    state: str = Field("Central", description="Central or State name")
    category: str = Field(..., description="Primary welfare sector/category")
    beneficiary_type: Optional[str] = Field("Individual Citizen", description="Target beneficiary unit")
    benefits: str = Field(..., min_length=5, description="Full description of financial or in-kind entitlements")
    estimated_benefit_amount: Optional[str] = Field(None, description="Quantified monetary benefit (e.g. '₹75,000 subsidy')")
    eligibility_text: Optional[str] = Field("", description="Full text of statutory eligibility criteria")
    application_process: Optional[str] = Field("", description="Step-by-step application instructions")
    documents_required: Optional[str] = Field("Aadhaar Card, Bank Passbook, Proof of Residence", description="Comma-separated required documents")
    apply_url: Optional[str] = None
    official_url: Optional[str] = None
    eligibility_age_min: Optional[int] = Field(None, ge=0, le=120)
    eligibility_age_max: Optional[int] = Field(None, ge=0, le=120)
    eligibility_gender: Optional[str] = Field("all", description="'all', 'female', or 'male'")
    eligibility_caste: Optional[str] = Field("[]", description="JSON list string e.g. '[\"SC\", \"ST\"]' or '[]'")
    eligibility_income_max: Optional[int] = Field(None, ge=0)
    eligibility_residence: Optional[str] = Field("both", description="'both', 'rural', or 'urban'")
    eligibility_state: Optional[str] = Field('["All"]', description="JSON list string of eligible states")
    eligibility_disability: Optional[bool] = False
    eligibility_bpl: Optional[bool] = False

class OgdSyncResponse(BaseModel):
    status: str
    source: str
    records_synced: int
    new_schemes_added: int
    vector_embeddings_indexed: int
    timestamp: str
    message: str
    newly_added_list: Optional[List[Dict[str, Any]]] = []
    verified_schemes_list: Optional[List[Dict[str, Any]]] = []

class LinkResolveResponse(BaseModel):
    slug: str
    status: str  # 'verified', 'auto_healed', 'mirror_fallback'
    resolved_url: str
    original_url: Optional[str] = None
    is_fallback: bool = False
    message: str
    application_mode: str = "online"

class LinkReportRequest(BaseModel):
    reason: Optional[str] = "Link appears broken or unreachable"

class LinkReportResponse(BaseModel):
    slug: str
    status: str = "recorded"
    report_count: int
    message: str



