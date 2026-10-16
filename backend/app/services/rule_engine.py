import json
import re
import time
from typing import List, Dict, Any, Optional, Tuple
from app.database.db import get_db
from app.models.user import UserProfileInput, MatchedSchemeResult, EligibilityMatchResponse
from app.services.link_resolver import classify_application_mode, classify_lifecycle_status

# Currency and financial amount extraction pattern
CURRENCY_REGEX = re.compile(
    r'(?:₹|Rs\.?|INR)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?(?:\s*(?:lakh|lakhs|crore|crores|thousand))?(?:\s*(?:/\-|\/year|\/month|per year|per month|annual|annually))?)',
    re.IGNORECASE
)

def parse_json_list(value: Optional[str]) -> List[str]:
    """Safely parses JSON list strings like '[\"SC\", \"ST\"]' or returns empty list."""
    if not value or value.strip() in ("", "[]", "null", "None"):
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed]
        return [str(parsed).strip()]
    except Exception:
        # Fallback to comma separation
        cleaned = value.strip("[]\"' ")
        return [x.strip(" \"'") for x in cleaned.split(",") if x.strip()]

def extract_benefit_amount(benefits_text: Optional[str]) -> Optional[str]:
    """Extracts first high-confidence monetary benefit amount from benefits description."""
    if not benefits_text:
        return None
    match = CURRENCY_REGEX.search(benefits_text)
    if match:
        amount_str = match.group(0).strip()
        # Clean up HTML tags if present
        clean_amount = re.sub(r'<[^>]+>', '', amount_str).strip()
        if len(clean_amount) <= 40:
            return clean_amount
    return None

def evaluate_scheme_eligibility(scheme: Dict[str, Any], profile: UserProfileInput) -> Tuple[bool, List[str], float]:
    """
    Evaluates a single scheme against a citizen profile using strict deterministic boolean logic.
    Returns:
      (is_eligible: bool, match_reasons: List[str], relevance_score: float)
    """
    reasons = []
    relevance_score = 50.0

    # 1. Age Rule
    age_min = scheme.get("eligibility_age_min")
    age_max = scheme.get("eligibility_age_max")
    
    if age_min is not None and profile.age < age_min:
        return False, [], 0.0
    if age_max is not None and profile.age > age_max:
        return False, [], 0.0
        
    if age_min is not None or age_max is not None:
        if age_min is not None and age_max is not None:
            reasons.append(f"Age {profile.age} fits within required bracket [{age_min} - {age_max}]")
        elif age_min is not None:
            reasons.append(f"Age {profile.age} satisfies minimum age ({age_min}+)")
        else:
            reasons.append(f"Age {profile.age} satisfies maximum age (under {age_max})")

    # 2. Gender Rule
    req_gender = (scheme.get("eligibility_gender") or "all").strip().lower()
    user_gender = (profile.gender or "").strip().lower()
    
    # Normalize common representations
    if user_gender in ("female", "woman", "women", "f"):
        user_gender_norm = "female"
    elif user_gender in ("male", "man", "men", "m"):
        user_gender_norm = "male"
    else:
        user_gender_norm = "other"

    if req_gender != "all":
        if req_gender != user_gender_norm:
            return False, [], 0.0
        reasons.append(f"Direct match for gender criteria: {req_gender.capitalize()}")
        relevance_score += 15.0

    # 3. Caste Category Rule
    raw_castes = scheme.get("eligibility_caste")
    caste_list = parse_json_list(raw_castes)
    user_caste = (profile.caste_category or "").strip()
    
    if caste_list and "All" not in caste_list and "all" not in [c.lower() for c in caste_list]:
        # Specific caste requirement exists
        matched_caste = any(c.lower() == user_caste.lower() for c in caste_list)
        if not matched_caste:
            return False, [], 0.0
        reasons.append(f"Qualifies under reserved category: {user_caste}")
        relevance_score += 15.0

    # 4. Income Ceiling Rule
    income_max = scheme.get("eligibility_income_max")
    if income_max is not None:
        if profile.annual_income > income_max:
            return False, [], 0.0
        reasons.append(f"Annual income ₹{profile.annual_income:,} is within limit of ₹{income_max:,}")
        relevance_score += 10.0

    # 5. Residence (Rural/Urban) Rule
    req_residence = (scheme.get("eligibility_residence") or "both").strip().lower()
    user_residence = (profile.residence or "both").strip().lower()
    
    if req_residence != "both":
        if user_residence != "both" and req_residence != user_residence:
            return False, [], 0.0
        reasons.append(f"Applies to {req_residence.capitalize()} area residents")
        relevance_score += 10.0

    # 6. State / Geographic Jurisdiction Rule
    scheme_state = (scheme.get("state") or "Central").strip()
    raw_elig_states = scheme.get("eligibility_state")
    elig_states = parse_json_list(raw_elig_states)
    user_state = (profile.state or "").strip().lower()
    
    is_central = scheme_state.lower() == "central" or "all" in [s.lower() for s in elig_states]
    
    if is_central:
        relevance_score += 5.0
        reasons.append("National / Central Government initiative applicable pan-India")
    else:
        # State specific scheme
        state_match = (scheme_state.lower() == user_state) or any(s.lower() == user_state for s in elig_states)
        if not state_match:
            return False, [], 0.0
        reasons.append(f"Specific to {scheme_state} state residents")
        relevance_score += 20.0

    # 7. Below Poverty Line (BPL) Rule
    req_bpl = bool(scheme.get("eligibility_bpl"))
    if req_bpl:
        if not profile.is_bpl:
            return False, [], 0.0
        reasons.append("Exclusive social welfare program for BPL cardholders")
        relevance_score += 20.0

    # 8. Disability Status Rule
    req_disability = bool(scheme.get("eligibility_disability"))
    if req_disability:
        if not profile.has_disability:
            return False, [], 0.0
        reasons.append("Dedicated program for Persons with Disabilities (PwD)")
        relevance_score += 25.0

    # 9. Occupation Keyword Boost
    if profile.occupation:
        occ = profile.occupation.strip().lower()
        name_desc = (str(scheme.get("name", "")) + " " + str(scheme.get("description", "")) + " " + str(scheme.get("category", ""))).lower()
        if occ in name_desc:
            reasons.append(f"Directly relevant to your profession: {profile.occupation.capitalize()}")
            relevance_score += 25.0

    # Default reason if none added
    if not reasons:
        reasons.append("Standard universal criteria met")

    return True, reasons, relevance_score

def match_eligible_schemes(profile: UserProfileInput, limit: int = 100) -> EligibilityMatchResponse:
    """
    Evaluates all 4,693 schemes in SQLite database against the citizen profile.
    Returns ranked eligible schemes with match reasons, category breakdown, and total estimate.
    """
    t0 = time.perf_counter()

    with get_db() as conn:
        conn.row_factory = None
        cursor = conn.cursor()
        
        # Pre-filter query using SQL indexes for fast execution
        # We fetch schemes where state is Central OR user's state, and gender is 'all' OR user's gender
        user_gender = (profile.gender or "all").strip().lower()
        if user_gender in ("female", "woman", "women", "f"):
            g_filter = ("all", "female")
        elif user_gender in ("male", "man", "men", "m"):
            g_filter = ("all", "male")
        else:
            g_filter = ("all", "female", "male")

        gender_placeholders = ",".join("?" for _ in g_filter)
        
        st = (profile.state or "").strip()
        state_is_universal = st.lower() in ("all", "pan-india", "central", "")

        if state_is_universal:
            state_clause = "(state = 'Central' OR eligibility_state LIKE '%All%')"
            state_params = []
        else:
            state_clause = "(state = 'Central' OR LOWER(state) = LOWER(?) OR eligibility_state LIKE '%All%' OR eligibility_state LIKE ?)"
            state_params = [st, f"%{st}%"]

        query = f"""
            SELECT 
                slug, name, state, category, benefits, official_url, apply_url, 
                documents_required, eligibility_age_min, eligibility_age_max, 
                eligibility_gender, eligibility_caste, eligibility_income_max, 
                eligibility_residence, eligibility_state, eligibility_disability, 
                eligibility_bpl, description, application_process, eligibility_text
            FROM schemes
            WHERE {state_clause}
              AND eligibility_gender IN ({gender_placeholders})
        """
        
        params = state_params + list(g_filter)
        cursor.execute(query, params)
        rows = cursor.fetchall()

    columns = [
        "slug", "name", "state", "category", "benefits", "official_url", "apply_url",
        "documents_required", "eligibility_age_min", "eligibility_age_max",
        "eligibility_gender", "eligibility_caste", "eligibility_income_max",
        "eligibility_residence", "eligibility_state", "eligibility_disability",
        "eligibility_bpl", "description", "application_process", "eligibility_text"
    ]

    matched_results: List[MatchedSchemeResult] = []
    category_counts: Dict[str, int] = {}

    for row in rows:
        scheme_dict = dict(zip(columns, row))
        is_eligible, reasons, score = evaluate_scheme_eligibility(scheme_dict, profile)
        
        if is_eligible:
            benefit_amount = extract_benefit_amount(scheme_dict.get("benefits"))
            app_mode = classify_application_mode(scheme_dict.get("application_process"), scheme_dict.get("apply_url"))
            status = classify_lifecycle_status(scheme_dict.get("name", ""), scheme_dict.get("description"), scheme_dict.get("eligibility_text"))
            
            result = MatchedSchemeResult(
                slug=scheme_dict["slug"],
                name=scheme_dict["name"] or "Unnamed Scheme",
                state=scheme_dict["state"] or "Central",
                category=scheme_dict["category"] or "General Welfare",
                benefits=scheme_dict["benefits"],
                official_url=scheme_dict["official_url"],
                apply_url=scheme_dict["apply_url"],
                documents_required=scheme_dict["documents_required"],
                relevance_score=round(score, 1),
                match_reasons=reasons,
                estimated_benefit_amount=benefit_amount,
                application_mode=app_mode,
                lifecycle_status=status
            )
            matched_results.append(result)
            
            # Aggregate category counts
            cat = result.category or "General"
            # Category field can be comma separated
            main_cat = cat.split(",")[0].strip()
            category_counts[main_cat] = category_counts.get(main_cat, 0) + 1

    # Sort results by relevance_score descending
    matched_results.sort(key=lambda x: x.relevance_score, reverse=True)

    # Calculate summary
    total_count = len(matched_results)
    top_results = matched_results[:limit]
    
    elapsed_ms = (time.perf_counter() - t0) * 1000
    benefit_summary = f"Identified {total_count} qualifying government welfare schemes matching your demographic criteria in {elapsed_ms:.1f}ms."

    return EligibilityMatchResponse(
        total_matched=total_count,
        matched_schemes=top_results,
        category_breakdown=category_counts,
        potential_benefit_summary=benefit_summary,
        user_profile=profile
    )
