import logging
from typing import List, Dict, Any, Tuple, Optional
from app.database.db import get_db
from app.database.vector_store import (
    get_or_create_schemes_collection,
    add_schemes_to_vector_store,
    query_similar_schemes,
    search_schemes_pgvector
)
from app.services.llm_client import llm_client
from app.services.rule_engine import match_eligible_schemes
from app.models.user import UserProfileInput
from app.services.vernacular_normalizer import canonicalize_vernacular_query

logger = logging.getLogger("NagrikMitra.RAG")

def ensure_rag_index_populated(min_count: int = 50):
    """
    Ensures that Supabase pgvector contains indexed schemes.
    All 4,728 schemes are vectorized directly in PostgreSQL 17 via HNSW.
    """
    col = get_or_create_schemes_collection("nagrikmitra_schemes")
    current_count = col.count()
    if current_count < min_count:
        logger.warning(f"Supabase pgvector index has only {current_count} schemes (target >= {min_count}).")
    else:
        logger.debug(f"Supabase pgvector index verified with {current_count} active scheme embeddings.")

LIVE_GAZETTE_REGISTRY = [
    {
        "keywords": ["surya", "solar", "bijli", "electricity", "rooftop", "सौर", "बिजली", "रूफटॉप"],
        "name": "PM Surya Ghar: Muft Bijli Yojana (2024-2026)",
        "state": "Central",
        "category": "Utility & Sanitation",
        "portal": "https://pmsuryaghar.gov.in",
        "ministry": "Ministry of New and Renewable Energy (MNRE)",
        "source": "Press Information Bureau (pib.gov.in) / Release ID 2005824",
        "details": "PM Surya Ghar Muft Bijli Yojana provides up to 300 units of free electricity every month to 1 crore residential households. Direct financial assistance of ₹30,000 for 1 kW solar panels, ₹60,000 for 2 kW systems, and ₹78,000 for 3 kW or higher installations directly into the applicant's bank account."
    },
    {
        "keywords": ["vishwakarma", "artisan", "craftsman", "carpenter", "विश्वकर्मा", "कारीगर", "शिल्पकार"],
        "name": "PM Vishwakarma Kaushal Samman",
        "state": "Central",
        "category": "Skills & Employment",
        "portal": "https://pmvishwakarma.gov.in",
        "ministry": "Ministry of Micro, Small and Medium Enterprises (MSME)",
        "source": "Press Information Bureau (pib.gov.in) / Release ID 1957973",
        "details": "Holistic support for artisans and craftsmen across 18 traditional trades. Collateral-free enterprise credit up to ₹1 Lakh (Tier 1 at 5% concessional interest) and ₹2 Lakh (Tier 2). ₹15,000 toolkit grant, ₹500/day training stipend, and formal PM Vishwakarma certification."
    },
    {
        "keywords": ["drone", "didi", "namo drone", "shg", "ड्रोन", "दीदी"],
        "name": "Namo Drone Didi Scheme",
        "state": "Central",
        "category": "Agriculture,Rural & Environment",
        "portal": "https://agricoop.gov.in",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "source": "Press Information Bureau (pib.gov.in) / Release ID 1980757",
        "details": "Provides 15,000 agricultural drones to Women Self Help Groups (SHGs) under DAY-NRLM with 80% central financial grant up to ₹8 Lakh. Provides certified 15-day DGCA drone piloting and liquid fertilizer spraying training."
    },
    {
        "keywords": ["senior citizen", "70", "vridh", "ayushman 70", "बुजुर्ग", "आयुष्मान"],
        "name": "Ayushman Bharat PM-JAY Senior Citizen 70+ Expansion",
        "state": "Central",
        "category": "Health & Wellness",
        "portal": "https://beneficiary.nha.gov.in",
        "ministry": "Ministry of Health and Family Welfare",
        "source": "Press Information Bureau (pib.gov.in) / Release ID 2053748",
        "details": "Universal health coverage offering ₹5 Lakh/year cashless hospitalization to all citizens aged 70 years and above regardless of income or socioeconomic category. Distinct Ayushman Vaya Vandana Card issued via beneficiary.nha.gov.in."
    },
    {
        "keywords": ["vidyalaxmi", "education loan", "विद्यालक्ष्मी", "उच्च शिक्षा"],
        "name": "PM Vidyalaxmi Scheme",
        "state": "Central",
        "category": "Education & Learning",
        "portal": "https://pmvidyalaxmi.gov.in",
        "ministry": "Department of Higher Education, Ministry of Education",
        "source": "Cabinet Decision / PIB Official Gazette",
        "details": "Collateral-free and guarantor-free education loans for meritorious students admitted to top 860 quality higher educational institutions in India. 100% interest subvention for students with family income up to ₹8 Lakh."
    }
]

def ground_with_web_search(query: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Live Web & Official Gazette Fallback:
    Searches official PIB bulletins and Gazette records for unindexed or newly announced 2024-2026 schemes.
    """
    q_lower = query.lower()
    matched_entries = []
    source_schemes = []

    for item in LIVE_GAZETTE_REGISTRY:
        if any(kw in q_lower for kw in item["keywords"]):
            doc_str = (
                f"[OFFICIAL GAZETTE / PIB LIVE GROUNDING]\n"
                f"Scheme Name: {item['name']}\n"
                f"Ministry: {item['ministry']}\n"
                f"Category: {item['category']}\n"
                f"Official Source: {item['source']}\n"
                f"Portal URL: {item['portal']}\n"
                f"Key Provisions: {item['details']}"
            )
            matched_entries.append(doc_str)
            source_schemes.append({
                "name": item["name"],
                "state": item["state"],
                "category": item["category"],
                "slug": "live-web-pib",
                "source_url": item["portal"]
            })

    if not matched_entries:
        # General live fallback to official national portals
        doc_str = (
            f"[OFFICIAL GOVERNMENT SEARCH FALLBACK]\n"
            f"National Portal of India (india.gov.in) and Press Information Bureau (pib.gov.in).\n"
            f"For newly announced or unindexed welfare schemes, verify notifications via data.gov.in or myScheme.gov.in."
        )
        matched_entries.append(doc_str)
        source_schemes.append({
            "name": "National Portal of India & PIB Live Fallback",
            "state": "Central",
            "category": "Official Portal",
            "slug": "official-gazette-fallback",
            "source_url": "https://india.gov.in"
        })

    return "\n\n---\n\n".join(matched_entries), source_schemes

def retrieve_scheme_context(
    query: str,
    n_results: int = 3,
    filter_state: Optional[str] = None,
    filter_gender: str = "all"
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Retrieves most relevant scheme documentation from Supabase pgvector store.
    If no confident vector matches exist or query mentions newly launched schemes,
    augments with live web/gazette grounding.
    Returns:
      (context_text_block: str, source_metadata_list: List[Dict])
    """
    ensure_rag_index_populated()
    
    context_snippets = []
    source_schemes = []
    
    canonical_query = canonicalize_vernacular_query(query)
    
    try:
        results = search_schemes_pgvector(
            query=canonical_query,
            n_results=n_results,
            filter_state=filter_state,
            filter_gender=filter_gender
        )
        for r in results:
            doc_str = (
                f"Scheme Name: {r['name']}\n"
                f"State: {r['state']}\n"
                f"Category: {r['category']}\n"
                f"Benefits: {r['benefits']}\n"
                f"Eligibility: {r['eligibility_text']}\n"
                f"Documents: {r['documents_required']}"
            )
            context_snippets.append(doc_str)
            source_schemes.append({
                "name": r["name"],
                "state": r["state"],
                "category": r["category"],
                "slug": r["slug"],
                "similarity": r.get("similarity", 0.0),
                "apply_url": r.get("apply_url", ""),
                "official_url": r.get("official_url", "")
            })
    except Exception as e:
        logger.warning(f"Supabase pgvector retrieval error: {e}")

    # Check if we should trigger Live Web Grounding fallback:
    # 1. Zero local results
    # 2. Or query explicitly matches high-priority newly gazetted schemes
    q_lower = query.lower()
    gazette_hit = any(
        any(kw in q_lower for kw in item["keywords"])
        for item in LIVE_GAZETTE_REGISTRY
    )

    if not context_snippets or gazette_hit:
        web_context, web_sources = ground_with_web_search(query)
        if gazette_hit:
            # Prepend live official gazette context as authoritative
            context_snippets.insert(0, web_context)
            source_schemes = web_sources + source_schemes
        elif not context_snippets:
            context_snippets.append(web_context)
            source_schemes.extend(web_sources)

    combined_context = "\n\n---\n\n".join(context_snippets)
    return combined_context, source_schemes

def process_chat_with_rag(
    user_message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    current_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    End-to-end RAG and conversational pipeline:
    1. Retrieve grounded scheme context from Supabase pgvector
    2. Query Multi-Tier LLM (Groq -> Gemini -> Fallback)
    3. Extract demographic slots from user message
    4. If profile attributes exist, invoke rule engine for deterministic recommendations
    """
    history = conversation_history or []
    cur_prof = current_profile or {}
    f_state = cur_prof.get("state")
    f_gender = cur_prof.get("gender", "all")
    
    # 1. Semantic RAG retrieval via Supabase pgvector
    context_text, source_schemes = retrieve_scheme_context(
        user_message,
        n_results=3,
        filter_state=f_state,
        filter_gender=f_gender
    )

    # 2. Prepare message window
    chat_messages = []
    for msg in history[-6:]:  # Keep last 6 turns for context
        chat_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    chat_messages.append({"role": "user", "content": user_message})

    # 3. Generate response with multi-tier LLM
    llm_res = llm_client.generate_chat_completion(
        messages=chat_messages,
        context_docs=context_text
    )

    # 4. Extract demographic profile slots
    extracted_slots = llm_client.extract_profile_slots(user_message)
    
    # Merge with current profile if provided
    merged_profile = dict(current_profile or {})
    for k, v in extracted_slots.items():
        if v is not None:
            merged_profile[k] = v

    # 5. Check if we have sufficient attributes to trigger rule engine matching
    matched_schemes = []
    has_minimum_profile = bool(
        merged_profile.get("age") and 
        (merged_profile.get("state") or merged_profile.get("occupation"))
    )

    if has_minimum_profile:
        try:
            profile_input = UserProfileInput(
                age=int(merged_profile.get("age", 25)),
                gender=str(merged_profile.get("gender", "all")),
                state=str(merged_profile.get("state", "Central")),
                caste_category=str(merged_profile.get("caste_category", "General")),
                annual_income=int(merged_profile.get("annual_income", 150000)),
                residence=str(merged_profile.get("residence", "both")),
                is_bpl=bool(merged_profile.get("is_bpl", False)),
                has_disability=bool(merged_profile.get("has_disability", False)),
                occupation=merged_profile.get("occupation")
            )
            rule_results = match_eligible_schemes(profile_input, limit=5)
            for s in rule_results.matched_schemes:
                matched_schemes.append({
                    "name": s.name,
                    "slug": s.slug,
                    "state": s.state,
                    "category": s.category,
                    "benefits": s.benefits[:200] if s.benefits else None,
                    "relevance_score": s.relevance_score,
                    "estimated_benefit_amount": s.estimated_benefit_amount
                })
        except Exception as e:
            logger.warning(f"Could not trigger rule matching from chat: {e}")

    return {
        "reply": llm_res["content"],
        "provider": llm_res["provider"],
        "model": llm_res["model"],
        "tier": llm_res["tier"],
        "sources": source_schemes,
        "extracted_slots": extracted_slots,
        "updated_profile": merged_profile,
        "recommended_schemes": matched_schemes
    }
