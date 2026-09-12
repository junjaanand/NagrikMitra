from fastapi import APIRouter, HTTPException, Query
from app.models.user import UserProfileInput, EligibilityMatchResponse
from app.services.rule_engine import match_eligible_schemes

router = APIRouter()

@router.get("/")
async def eligibility_info():
    """Information on available eligibility matching endpoints."""
    return {
        "status": "ready",
        "description": "Deterministic government scheme eligibility evaluation service",
        "endpoints": {
            "match": "POST /api/eligibility/match",
            "quick_check": "POST /api/eligibility/quick-check"
        }
    }

@router.post("/match", response_model=EligibilityMatchResponse)
async def match_schemes(
    profile: UserProfileInput,
    limit: int = Query(100, ge=1, le=500, description="Max schemes to return")
):
    """
    Evaluates citizen demographic profile against all 4,693 government welfare schemes.
    Returns ranked eligible schemes with transparent match reasons, category analytics, and subsidy estimations.
    """
    try:
        results = match_eligible_schemes(profile, limit=limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eligibility evaluation error: {str(e)}")

@router.post("/quick-check")
async def quick_check_eligibility(profile: UserProfileInput):
    """
    Lightweight eligibility check returning top 5 matched schemes and macro statistics.
    """
    results = match_eligible_schemes(profile, limit=5)
    return {
        "total_eligible": results.total_matched,
        "top_schemes": results.matched_schemes,
        "category_breakdown": results.category_breakdown,
        "summary": results.potential_benefit_summary
    }
