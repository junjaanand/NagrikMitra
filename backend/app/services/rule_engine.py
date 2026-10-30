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

# Statutory Age Relaxation Map (Standard Indian Government Directives)
AGE_RELAXATION_MAP = {
    "sc": 5,
    "st": 5,
    "obc": 3,
    "pwd": 10,
    "widow": 5
}

# Ration Card Color Proxy Benchmarks (Resolves Rural Self-Declaration Illiteracy)
RATION_CARD_PROXIES = {
    "yellow": {"is_bpl": True, "income_limit": 100000, "default_income": 80000, "label": "BPL / Antyodaya (Yellow)"},
    "antyodaya": {"is_bpl": True, "income_limit": 100000, "default_income": 60000, "label": "Antyodaya Anna Yojana"},
    "orange": {"is_bpl": False, "income_limit": 250000, "default_income": 180000, "label": "Lower-Middle (Orange/Kesariya)"},
    "kesariya": {"is_bpl": False, "income_limit": 250000, "default_income": 180000, "label": "Lower-Middle (Orange/Kesariya)"},
    "white": {"is_bpl": False, "income_limit": 99999999, "default_income": 350000, "label": "General / APL (White)"},
    "apl": {"is_bpl": False, "income_limit": 99999999, "default_income": 350000, "label": "General / APL (White)"}
}

# Vernacular Indic Livelihood Synonym Map (40+ Terms)
OCCUPATION_SYNONYMS = {
    "farmer": [
        "farmer", "kisan", "krishi", "agriculture", "cultivator", "kheti", "horticulture",
        "dairy", "khatauni", "zameen", "landholder", "fasal", "bhoomi", "animal husbandry", "pashupalan"
    ],
    "artisan": [
        "artisan", "craftsman", "vishwakarma", "carpenter", "blacksmith", "potter", "weaver",
        "bunkar", "tailor", "handloom", "hathkargha", "shilpkar", "karigar", "handicraft", "cobbler", "mistry"
    ],
    "student": [
        "student", "scholarship", "vidyarthi", "chhatra", "education", "college", "school",
        "shiksha", "post-matric", "pre-matric", "higher education", "phd", "fellowship"
    ],
    "laborer": [
        "laborer", "worker", "shramik", "majdoor", "construction", "mgnrega", "daily wage",
        "e-shram", "bhavan nirman", "unorganized", "coolie", "hamal"
    ],
    "entrepreneur": [
        "msme", "business", "udyam", "startup", "shopkeeper", "vendor", "rehri", "patri",
        "vyapar", "self-employed", "swarojgar", "small enterprise", "dukan"
    ],
    "women": [
        "mahila", "woman", "women", "ladki", "kanya", "beti", "nari", "matritva", "widow",
        "single mother", "kanya sumangala", "majhi ladki", "anganwadi"
    ]
}

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
        cleaned = value.strip("[]\"' ")
        return [x.strip(" \"'") for x in cleaned.split(",") if x.strip()]

def extract_benefit_amount(benefits_text: Optional[str]) -> Optional[str]:
    """Extracts first high-confidence monetary benefit amount from benefits description."""
    if not benefits_text:
        return None
    match = CURRENCY_REGEX.search(benefits_text)
    if match:
        amount_str = match.group(0).strip()
        clean_amount = re.sub(r'<[^>]+>', '', amount_str).strip()
        if len(clean_amount) <= 40:
            return clean_amount
    return None

def extract_micro_conditions(eligibility_text: Optional[str], documents_text: Optional[str]) -> List[Dict[str, Any]]:
    """
    Stage 2 AST Parser: Extracts progressive micro-criteria condition chips from unstructured legal text.
    """
    combined = f"{eligibility_text or ''} {documents_text or ''}".lower()
    conditions = []
    
    # 1. Agricultural Landholding
    if re.search(r'(land|hectare|acre|kisan|cultivable|bhoomi|khatauni|zameen)', combined):
        if re.search(r'(small and marginal|2 hectare|up to 2|less than 2|2\s*ha|5 acre)', combined):
            conditions.append({
                "id": "land_marginal",
                "label": "Cultivable Land (< 2 Hectares)",
                "category": "Landholding",
                "icon": "🌱"
            })
        else:
            conditions.append({
                "id": "land_any",
                "label": "Agricultural Land Ownership Proof",
                "category": "Landholding",
                "icon": "🌾"
            })
            
    # 2. Academic Qualification / Merit
    if re.search(r'(10th|12th|matric|graduation|degree|marks|percentage|cgpa|60%|50%)', combined):
        conditions.append({
            "id": "academic_proof",
            "label": "Marksheet & Enrollment Proof",
            "category": "Education",
            "icon": "🎓"
        })

    # 3. Maternal / Pregnancy Milestone
    if re.search(r'(pregnant|lactating|trimester|infant|delivery|institutional delivery|child birth|matritva)', combined):
        conditions.append({
            "id": "maternal_proof",
            "label": "MCP Card / Pregnancy Registration",
            "category": "Health",
            "icon": "👶"
        })

    # 4. Residence / Domicile Certificate
    if re.search(r'(domicile|praman patra|residence certificate|mool niwas|bonafide)', combined):
        conditions.append({
            "id": "domicile_cert",
            "label": "State Domicile Certificate",
            "category": "Documentation",
            "icon": "📜"
        })

    # 5. Income Certificate
    if re.search(r'(income certificate|aay praman|tehsildar|talati|revenue officer)', combined):
        conditions.append({
            "id": "income_cert",
            "label": "Official Income Certificate",
            "category": "Documentation",
            "icon": "📑"
        })

    # 6. Caste Verification Certificate
    if re.search(r'(caste certificate|jati praman|validity certificate)', combined):
        conditions.append({
            "id": "caste_cert",
            "label": "Caste Verification Certificate",
            "category": "Documentation",
            "icon": "🏷️"
        })

    # 7. Active Bank Account / Aadhaar Seeding
    if re.search(r'(bank account|dbt|aadhaar seeded|npci|passbook|ifsc)', combined):
        conditions.append({
            "id": "bank_dbt",
            "label": "Aadhaar-Seeded Bank Account (DBT)",
            "category": "Banking",
            "icon": "🏦"
        })

    return conditions[:4]

def evaluate_scheme_eligibility_funnel(
    scheme: Dict[str, Any], 
    profile: UserProfileInput
) -> Tuple[bool, int, List[str], List[str], float, List[Dict[str, Any]], Optional[str]]:
    """
    Two-Stage Funnel Evaluator:
    - Stage 1: Deterministic Macro SQL Screening across 8 Universal Boundaries with Statutory Relaxations.
    - Stage 2: Progressive Micro-Criteria AST Disclosure and Calibrated Multi-Factor Scoring.

    Returns:
      (is_eligible: bool, tier: int, match_reasons: List[str], missing_criteria: List[str], 
       relevance_score: float, micro_conditions: List[Dict[str, Any]], actionable_guidance: Optional[str])
      Tier 1: 100% Fully Eligible (Direct Match)
      Tier 2: Near-Match / Action Required (Eligible via relaxation, 10% income buffer, or 1 condition needed)
      Tier 0: Strictly Ineligible
    """
    reasons = []
    missing = []
    relevance_score = 50.0  # Base calibration score
    tier = 1
    guidance = None

    # --------------------------------------------------------------------------
    # 1. Statutory Age Evaluation with Grace Periods
    # --------------------------------------------------------------------------
    age_min = scheme.get("eligibility_age_min")
    age_max = scheme.get("eligibility_age_max")
    user_caste = (profile.caste_category or "").strip().lower()
    
    grace_years = 0
    if profile.has_disability:
        grace_years = max(grace_years, AGE_RELAXATION_MAP["pwd"])
    if user_caste in AGE_RELAXATION_MAP:
        grace_years = max(grace_years, AGE_RELAXATION_MAP[user_caste])
    if getattr(profile, "is_widow", False):
        grace_years = max(grace_years, AGE_RELAXATION_MAP["widow"])

    if age_min is not None and profile.age < age_min:
        return False, 0, [], [f"Minimum age requirement is {age_min} years"], 0.0, [], None

    if age_max is not None:
        if profile.age <= age_max:
            reasons.append(f"Age {profile.age} satisfies base age limit (under {age_max})")
        elif grace_years > 0 and profile.age <= (age_max + grace_years):
            # Qualifies via statutory affirmative policy!
            reasons.append(f"Qualifies with {grace_years}-year {profile.caste_category} statutory age relaxation (Limit: {age_max} -> {age_max + grace_years})")
            relevance_score += 10.0
        elif grace_years > 0 and profile.age <= (age_max + grace_years + 1):
            # Borderline near-miss with statutory category
            tier = 2
            missing.append(f"Age {profile.age} slightly exceeds relaxation ceiling of {age_max + grace_years} years")
            guidance = "Verify if discretionary departmental age condonation applies."
        else:
            return False, 0, [], [f"Age {profile.age} exceeds maximum ceiling of {age_max + grace_years} years"], 0.0, [], None

    # --------------------------------------------------------------------------
    # 2. Gender Rule (Deterministic)
    # --------------------------------------------------------------------------
    req_gender = (scheme.get("eligibility_gender") or "all").strip().lower()
    user_gender = (profile.gender or "").strip().lower()
    
    if user_gender in ("female", "woman", "women", "f"):
        user_gender_norm = "female"
    elif user_gender in ("male", "man", "men", "m"):
        user_gender_norm = "male"
    else:
        user_gender_norm = "other"

    if req_gender != "all":
        if req_gender != user_gender_norm:
            return False, 0, [], [f"Restricted to {req_gender.capitalize()} beneficiaries only"], 0.0, [], None
        reasons.append(f"Targeted affirmative program for {req_gender.capitalize()} citizens")
        relevance_score += 15.0

    # --------------------------------------------------------------------------
    # 3. Caste Category Rule
    # --------------------------------------------------------------------------
    raw_castes = scheme.get("eligibility_caste")
    caste_list = parse_json_list(raw_castes)
    clean_user_caste = (profile.caste_category or "").strip()
    
    if caste_list and "All" not in caste_list and "all" not in [c.lower() for c in caste_list]:
        matched_caste = any(c.lower() == clean_user_caste.lower() for c in caste_list)
        if not matched_caste:
            return False, 0, [], [f"Targeted exclusively to {', '.join(caste_list)} categories"], 0.0, [], None
        reasons.append(f"Direct match for reserved category: {clean_user_caste}")
        relevance_score += 15.0

    # --------------------------------------------------------------------------
    # 4. Income Ceiling with 10% Statutory Tolerance
    # --------------------------------------------------------------------------
    income_max = scheme.get("eligibility_income_max")
    eff_income = profile.annual_income

    if income_max is not None:
        if eff_income <= income_max:
            reasons.append(f"Annual income ₹{eff_income:,} is within limit of ₹{income_max:,}")
            relevance_score += 10.0
        elif eff_income <= (income_max * 1.10):
            # 10% statutory near-miss tolerance
            tier = 2
            missing.append(f"Annual income ₹{eff_income:,} slightly exceeds ₹{income_max:,} limit by ₹{eff_income - income_max:,} (within 10% tolerance)")
            guidance = "May qualify after claiming statutory standard deductions or agricultural allowances on gross income."
            relevance_score += 5.0
        else:
            return False, 0, [], [f"Annual income ₹{eff_income:,} exceeds limit of ₹{income_max:,}"], 0.0, [], None

    # --------------------------------------------------------------------------
    # 5. Residence (Rural / Urban)
    # --------------------------------------------------------------------------
    req_residence = (scheme.get("eligibility_residence") or "both").strip().lower()
    user_residence = (profile.residence or "both").strip().lower()
    
    if req_residence != "both":
        if user_residence != "both" and req_residence != user_residence:
            return False, 0, [], [f"Restricted to {req_residence.capitalize()} residents"], 0.0, [], None
        reasons.append(f"Dedicated {req_residence.capitalize()} development initiative")
        relevance_score += 10.0

    # --------------------------------------------------------------------------
    # 6. State / Geographic Jurisdiction
    # --------------------------------------------------------------------------
    scheme_state = (scheme.get("state") or "Central").strip()
    raw_elig_states = scheme.get("eligibility_state")
    elig_states = parse_json_list(raw_elig_states)
    user_state = (profile.state or "").strip().lower()
    
    is_central = scheme_state.lower() == "central" or "all" in [s.lower() for s in elig_states]
    
    if is_central:
        relevance_score += 5.0
        reasons.append("National / Central Government initiative applicable pan-India")
    else:
        state_match = (scheme_state.lower() == user_state) or any(s.lower() == user_state for s in elig_states)
        if not state_match:
            return False, 0, [], [f"Restricted to {scheme_state} state residents"], 0.0, [], None
        reasons.append(f"Exclusive to {scheme_state} state residents")
        relevance_score += 20.0

    # --------------------------------------------------------------------------
    # 7. Below Poverty Line (BPL) Rule
    # --------------------------------------------------------------------------
    req_bpl = bool(scheme.get("eligibility_bpl"))
    if req_bpl:
        if profile.is_bpl:
            reasons.append("Exclusive social welfare program for BPL cardholders")
            relevance_score += 20.0
        elif eff_income <= 120000:
            tier = 2
            missing.append("Requires valid BPL or Antyodaya Ration Card")
            guidance = "Apply for BPL Ration Card at local Tehsil or Gram Panchayat office."
        else:
            return False, 0, [], ["Requires active Below Poverty Line (BPL) status"], 0.0, [], None

    # --------------------------------------------------------------------------
    # 8. Disability Status Rule (PwD)
    # --------------------------------------------------------------------------
    req_disability = bool(scheme.get("eligibility_disability"))
    if req_disability:
        if not profile.has_disability:
            return False, 0, [], ["Dedicated program for Persons with Benchmark Disabilities (PwD)"], 0.0, [], None
        reasons.append("Dedicated affirmative action program for Persons with Disabilities (PwD)")
        relevance_score += 25.0

    # --------------------------------------------------------------------------
    # 9. Vernacular Livelihood Synonym Normalization
    # --------------------------------------------------------------------------
    if profile.occupation:
        user_occ = profile.occupation.strip().lower()
        search_corpus = (
            str(scheme.get("name", "")) + " " + 
            str(scheme.get("description", "")) + " " + 
            str(scheme.get("category", "")) + " " +
            str(scheme.get("eligibility_text", ""))
        ).lower()

        # Find matching synonym cluster
        synonym_tokens = [user_occ]
        for canonical_key, syn_list in OCCUPATION_SYNONYMS.items():
            if user_occ in syn_list or user_occ == canonical_key:
                synonym_tokens.extend(syn_list)
                break

        matched_synonym = next((t for t in set(synonym_tokens) if t in search_corpus), None)
        if matched_synonym:
            reasons.append(f"Directly relevant to your profession: {profile.occupation.capitalize()}")
            relevance_score += 25.0

    # --------------------------------------------------------------------------
    # 10. Frictionless Online Application Bonus
    # --------------------------------------------------------------------------
    app_process = str(scheme.get("application_process", ""))
    apply_url = str(scheme.get("apply_url", ""))
    if apply_url or "online" in app_process.lower():
        relevance_score += 5.0

    # --------------------------------------------------------------------------
    # Stage 2: Micro-Conditions Extraction
    # --------------------------------------------------------------------------
    micro_chips = extract_micro_conditions(scheme.get("eligibility_text"), scheme.get("documents_required"))

    if not reasons:
        reasons.append("Universal civic criteria verified")

    return True, tier, reasons, missing, round(min(180.0, relevance_score), 1), micro_chips, guidance

# Backwards compatible alias
def evaluate_scheme_eligibility(scheme: Dict[str, Any], profile: UserProfileInput) -> Tuple[bool, List[str], float]:
    is_elig, tier, reasons, _, score, _, _ = evaluate_scheme_eligibility_funnel(scheme, profile)
    return is_elig, reasons, score

def match_eligible_schemes(profile: UserProfileInput, limit: int = 100) -> EligibilityMatchResponse:
    """
    Two-Stage Funnel Recommendation Engine:
    1. Sub-15ms SQL Demographic Macro-Screening (with automatic Ration Card Color proxies).
    2. Stage 2 Progressive Micro-Criteria AST Evaluation, Statutory Relaxations, and Multi-Factor Ranking.
    """
    t0 = time.perf_counter()

    # Apply Ration Card Color Proxy to unblock rural income self-declaration
    if profile.ration_card_color:
        card_key = profile.ration_card_color.strip().lower()
        if card_key in RATION_CARD_PROXIES:
            proxy = RATION_CARD_PROXIES[card_key]
            if proxy["is_bpl"]:
                profile.is_bpl = True
            if profile.annual_income == 0:
                profile.annual_income = proxy["default_income"]

    with get_db() as conn:
        conn.row_factory = None
        cursor = conn.cursor()
        
        # Stage 1 SQL Macro-Filter: Evaluates state and gender using indexed B-Tree
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
                eligibility_bpl, description, application_process, eligibility_text,
                lifecycle_status, successor_slug, successor_name
            FROM schemes
            WHERE {state_clause}
              AND eligibility_gender IN ({gender_placeholders})
              AND (lifecycle_status IS NULL OR lifecycle_status NOT IN ('discontinued', 'dead_link'))
        """
        
        params = state_params + list(g_filter)
        cursor.execute(query, params)
        rows = cursor.fetchall()

    columns = [
        "slug", "name", "state", "category", "benefits", "official_url", "apply_url",
        "documents_required", "eligibility_age_min", "eligibility_age_max",
        "eligibility_gender", "eligibility_caste", "eligibility_income_max",
        "eligibility_residence", "eligibility_state", "eligibility_disability",
        "eligibility_bpl", "description", "application_process", "eligibility_text",
        "lifecycle_status", "successor_slug", "successor_name"
    ]

    matched_results: List[MatchedSchemeResult] = []
    category_counts: Dict[str, int] = {}

    for row in rows:
        scheme_dict = dict(zip(columns, row))
        is_eligible, tier, reasons, missing, score, micro_chips, guidance = evaluate_scheme_eligibility_funnel(scheme_dict, profile)
        
        if is_eligible:
            benefit_amount = extract_benefit_amount(scheme_dict.get("benefits"))
            app_mode = classify_application_mode(scheme_dict.get("application_process"), scheme_dict.get("apply_url"))
            status = scheme_dict.get("lifecycle_status") or classify_lifecycle_status(scheme_dict.get("name", ""), scheme_dict.get("description"), scheme_dict.get("eligibility_text"))
            
            result = MatchedSchemeResult(
                slug=scheme_dict["slug"],
                name=scheme_dict["name"] or "Unnamed Scheme",
                state=scheme_dict["state"] or "Central",
                category=scheme_dict["category"] or "General Welfare",
                benefits=scheme_dict["benefits"],
                official_url=scheme_dict["official_url"],
                apply_url=scheme_dict["apply_url"],
                documents_required=scheme_dict["documents_required"],
                relevance_score=score,
                match_reasons=reasons,
                estimated_benefit_amount=benefit_amount,
                application_mode=app_mode,
                lifecycle_status=status,
                eligibility_tier=tier,
                missing_criteria=missing,
                micro_conditions=micro_chips,
                actionable_guidance=guidance,
                successor_slug=scheme_dict.get("successor_slug"),
                successor_name=scheme_dict.get("successor_name")
            )
            matched_results.append(result)
            
            # Aggregate category counts
            cat = result.category or "General"
            main_cat = cat.split(",")[0].strip()
            category_counts[main_cat] = category_counts.get(main_cat, 0) + 1

    # Multi-Tier Sorting: Tier 1 (100% Matches) first, then ranked by relevance_score DESC
    matched_results.sort(key=lambda x: (x.eligibility_tier, -x.relevance_score))

    total_count = len(matched_results)
    top_results = matched_results[:limit]
    
    elapsed_ms = (time.perf_counter() - t0) * 1000
    benefit_summary = f"Two-Stage Funnel identified {total_count} qualifying schemes (Tier 1 & Tier 2) in {elapsed_ms:.1f}ms."

    return EligibilityMatchResponse(
        total_matched=total_count,
        matched_schemes=top_results,
        category_breakdown=category_counts,
        potential_benefit_summary=benefit_summary,
        user_profile=profile
    )
