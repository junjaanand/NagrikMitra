import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.rag_pipeline import process_chat_with_rag
from app.services.llm_client import llm_client
from app.config import settings

router = APIRouter()

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's query in Hindi or English")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation turns")
    current_profile: Optional[Dict[str, Any]] = Field(default=None, description="Existing citizen profile state")

class ChatResponse(BaseModel):
    reply: str
    provider: str
    model: str
    tier: int
    sources: List[Dict[str, Any]]
    extracted_slots: Dict[str, Any]
    updated_profile: Dict[str, Any]
    recommended_schemes: List[Dict[str, Any]]
    latency_ms: float

class SlotExtractionRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to extract demographic entities from")

@router.get("/")
async def chat_info():
    """Information on conversational AI endpoints."""
    return {
        "status": "ready",
        "description": "Multilingual conversational assistant with RAG context and slot extraction",
        "endpoints": {
            "message": "POST /api/chat/message",
            "extract_slots": "POST /api/chat/extract-slots",
            "status": "GET /api/chat/status"
        }
    }

@router.post("/message", response_model=ChatResponse)
async def handle_chat_message(request: ChatRequest):
    """
    Multilingual conversational AI endpoint with RAG context and Multi-Tier Fallback (Groq -> Gemini -> Local).
    Extracts demographic slots and returns grounded scheme recommendations in Hindi or English.
    """
    t0 = time.perf_counter()
    try:
        history_dicts = [{"role": m.role, "content": m.content} for m in request.history]
        result = process_chat_with_rag(
            user_message=request.message,
            conversation_history=history_dicts,
            current_profile=request.current_profile
        )
        latency = (time.perf_counter() - t0) * 1000
        
        return ChatResponse(
            reply=result["reply"],
            provider=result["provider"],
            model=result["model"],
            tier=result["tier"],
            sources=result["sources"],
            extracted_slots=result["extracted_slots"],
            updated_profile=result["updated_profile"],
            recommended_schemes=result["recommended_schemes"],
            latency_ms=round(latency, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")

@router.post("/extract-slots")
async def extract_demographic_slots(request: SlotExtractionRequest):
    """
    Extracts demographic slots (age, gender, state, income, caste, etc.) from natural language text.
    """
    try:
        slots = llm_client.extract_profile_slots(request.text)
        return {"extracted_slots": slots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slot extraction error: {str(e)}")

@router.get("/status")
async def chat_provider_status():
    """
    Returns active LLM configuration, fallback hierarchy status, and vector store readiness.
    """
    has_groq = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip())
    has_gemini = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())

    return {
        "primary_provider": settings.PRIMARY_LLM_PROVIDER,
        "fallback_hierarchy": [
            {"tier": 1, "provider": "Groq", "model": settings.GROQ_MODEL, "configured": has_groq},
            {"tier": 2, "provider": "Google Gemini", "model": settings.GEMINI_MODEL, "configured": has_gemini},
            {"tier": 3, "provider": "Local Grounded Synthesizer", "model": "rule_based", "configured": True}
        ],
        "groq_configured": has_groq,
        "gemini_configured": has_gemini,
        "local_fallback_active": True
    }
