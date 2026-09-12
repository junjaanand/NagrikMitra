import logging
from typing import List, Dict, Any, Tuple, Optional
from app.database.db import get_db
from app.database.vector_store import (
    get_or_create_schemes_collection,
    add_schemes_to_vector_store,
    query_similar_schemes
)
from app.services.llm_client import llm_client
from app.services.rule_engine import match_eligible_schemes
from app.models.user import UserProfileInput

logger = logging.getLogger("NagrikMitra.RAG")

def ensure_rag_index_populated(min_count: int = 50):
    """
    Ensures that top high-impact and central schemes are vectorized into ChromaDB.
    """
    col = get_or_create_schemes_collection("nagrikmitra_schemes")
    current_count = col.count()
    
    if current_count < min_count:
        logger.info(f"Populating ChromaDB RAG index (current: {current_count}, target: 100)...")
        with get_db() as conn:
            conn.row_factory = None
            c = conn.cursor()
            # Prioritize Central flagship schemes and top state schemes
            c.execute("""
                SELECT slug, name, state, category, benefits, eligibility_text, documents_required
                FROM schemes
                ORDER BY (CASE WHEN state = 'Central' THEN 1 ELSE 2 END), slug
                LIMIT 150
            """)
            rows = c.fetchall()

        schemes_to_index = []
        for r in rows:
            schemes_to_index.append({
                "slug": r[0],
                "name": r[1],
                "state": r[2],
                "category": r[3],
                "benefits": r[4] or "",
                "eligibility_text": r[5] or "",
                "documents_required": r[6] or ""
            })

        added = add_schemes_to_vector_store(schemes_to_index)
        logger.info(f"Indexed {added} schemes into ChromaDB RAG store.")

def retrieve_scheme_context(query: str, n_results: int = 3) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Retrieves most relevant scheme documentation from ChromaDB vector store.
    Returns:
      (context_text_block: str, source_metadata_list: List[Dict])
    """
    ensure_rag_index_populated()
    
    try:
        results = query_similar_schemes(query, n_results=n_results)
    except Exception as e:
        logger.warning(f"ChromaDB retrieval error: {e}")
        return "", []

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]

    context_snippets = []
    source_schemes = []

    for doc, meta in zip(docs, metas):
        context_snippets.append(doc)
        source_schemes.append({
            "name": meta.get("name", "Government Scheme"),
            "state": meta.get("state", "Central"),
            "category": meta.get("category", "Welfare"),
            "slug": meta.get("slug", "")
        })

    combined_context = "\n\n---\n\n".join(context_snippets)
    return combined_context, source_schemes

def process_chat_with_rag(
    user_message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    current_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    End-to-end RAG and conversational pipeline:
    1. Retrieve grounded scheme context from ChromaDB
    2. Query Multi-Tier LLM (Groq -> Gemini -> Fallback)
    3. Extract demographic slots from user message
    4. If profile attributes exist, invoke rule engine for deterministic recommendations
    """
    history = conversation_history or []
    
    # 1. Semantic RAG retrieval
    context_text, source_schemes = retrieve_scheme_context(user_message, n_results=3)

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
