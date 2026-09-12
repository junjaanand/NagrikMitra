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
