import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings

logger = logging.getLogger("NagrikMitra.LLM")

# System prompt for NagrikMitra conversational agent
NAGRIKMITRA_SYSTEM_PROMPT = """You are NagrikMitra (नागरिक मित्र — "Citizen's Friend"), an empathetic, highly knowledgeable AI assistant dedicated to helping Indian citizens discover and apply for government welfare schemes.

Key Directives:
1. Multilingual Fluency: Respond naturally in the language of the user (Hindi in Devanagari script, English, or Hinglish).
2. Empathetic & Accessible: Explain bureaucratic eligibility and application procedures in simple, everyday language without legal jargon.
3. Source-Grounded: Base your scheme advice strictly on the provided scheme context. If you do not know or the information is not in the context, clearly advise the citizen to check the official portal.
4. Actionable Steps: Highlight monetary benefits (e.g., ₹6,000/yr), required identity documents (Aadhaar, ration card), and direct application URLs.
5. Conversational Profile Extraction: Gently ask clarifying questions if key details (state, age, occupation, income) are missing so you can recommend exact schemes.
"""

def parse_profile_regex_fallback(text: str) -> Dict[str, Any]:
    """Rule-based and regex slot extractor for Hindi & English when LLM is unavailable."""
    profile = {}
    lower = text.lower()

    # Age pattern
    age_match = re.search(r'(\d{1,2})\s*(?:साल|वर्ष|years?|yr|yrs?|age)\b', lower)
    if not age_match:
        age_match = re.search(r'\b(?:age|उम्र|आयु)\s*(?:is|:|=)?\s*(\d{1,2})\b', lower)
    if age_match:
        try:
            val = int(age_match.group(1))
            if 0 < val <= 110:
                profile["age"] = val
        except Exception:
            pass

    # Gender pattern
    if any(w in lower for w in ("female", "woman", "women", "girl", "महिला", "लड़की", "औरत", "स्त्री")):
        profile["gender"] = "female"
    elif any(w in lower for w in ("male", "man", "boy", "पुरुष", "लड़का", "आदमी")):
        profile["gender"] = "male"

    # Occupation pattern
    if any(w in lower for w in ("किसान", "farmer", "krishi", "khet", "खेती", "agriculture")):
        profile["occupation"] = "farmer"
    elif any(w in lower for w in ("छात्र", "छात्रा", "student", "scholarship", "पढ़ाई")):
        profile["occupation"] = "student"
    elif any(w in lower for w in ("कारीगर", "artisan", "weaver", "बुनकर", "craftsman")):
        profile["occupation"] = "artisan"
    elif any(w in lower for w in ("श्रमिक", "मजदूर", "laborer", "worker", "construction")):
        profile["occupation"] = "laborer"

    # Caste pattern
    if "sc" in lower or "अनुसूचित जाति" in lower:
        profile["caste_category"] = "SC"
    elif "st" in lower or "अनुसूचित जनजाति" in lower:
        profile["caste_category"] = "ST"
    elif "obc" in lower or "ओबीसी" in lower or "अन्य पिछड़ा वर्ग" in lower:
        profile["caste_category"] = "OBC"
    elif "general" in lower or "सामान्य" in lower:
        profile["caste_category"] = "General"

    # Income pattern
    income_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:लाख|lakh|lakhs|lac|lacs)', lower)
    if income_match:
        try:
            lakh_val = float(income_match.group(1))
            profile["annual_income"] = int(lakh_val * 100000)
        except Exception:
            pass
    else:
        num_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9]{4,8})\b', lower)
        if num_match:
            try:
                profile["annual_income"] = int(num_match.group(1))
            except Exception:
                pass

    # Residence pattern
    if any(w in lower for w in ("ग्रामीण", "गाँव", "गांव", "rural", "village")):
        profile["residence"] = "rural"
    elif any(w in lower for w in ("शहरी", "शहर", "urban", "city")):
        profile["residence"] = "urban"

    # State pattern
    states_map = {
        "uttar pradesh": "Uttar Pradesh", "up": "Uttar Pradesh", "उत्तर प्रदेश": "Uttar Pradesh",
        "maharashtra": "Maharashtra", "महाराष्ट्र": "Maharashtra",
        "gujarat": "Gujarat", "गुजरात": "Gujarat",
        "rajasthan": "Rajasthan", "राजस्थान": "Rajasthan",
        "madhya pradesh": "Madhya Pradesh", "mp": "Madhya Pradesh", "मध्य प्रदेश": "Madhya Pradesh",
        "bihar": "Bihar", "बिहार": "Bihar",
        "delhi": "Delhi", "दिल्ली": "Delhi",
        "tamil nadu": "Tamil Nadu", "तमिलनाडु": "Tamil Nadu",
        "karnataka": "Karnataka", "कर्नाटक": "Karnataka",
        "west bengal": "West Bengal", "पश्चिम बंगाल": "West Bengal",
        "punjab": "Punjab", "पंजाब": "Punjab",
        "haryana": "Haryana", "हरियाणा": "Haryana"
    }
    for k, v in states_map.items():
        if re.search(r'\b' + re.escape(k) + r'\b', lower):
            profile["state"] = v
            break

    # BPL pattern
    if any(w in lower for w in ("bpl", "बीपीएल", "गरीबी रेखा", "ration card bpl")):
        profile["is_bpl"] = True

    # Disability pattern
    if any(w in lower for w in ("विकलांग", "दिव्यांग", "disability", "disabled", "pwd", "handicapped")):
        profile["has_disability"] = True

    return profile

class MultiTierLLMClient:
    """
    Multi-Tier Fallback LLM Client:
    Tier 1 (Primary): Groq API (llama-3.3-70b-versatile, fallback to llama-3.1-8b-instant)
    Tier 2 (Secondary): Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
    Tier 3 (Tertiary): Local Grounded Synthesizer (offline template generation based on RAG context)
    """

    def __init__(self):
        self._groq_client = None
        self._gemini_client = None

    def _get_groq_client(self):
        if self._groq_client is None:
            key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
            if key and key.strip():
                try:
                    import groq
                    self._groq_client = groq.Groq(api_key=key.strip())
                except Exception as e:
                    logger.warning(f"Failed to initialize Groq client: {e}")
        return self._groq_client

    def _get_gemini_client(self):
        if self._gemini_client is None:
            key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
            if key and key.strip():
                try:
                    # Try modern google.genai first
                    import google.genai as genai
                    self._gemini_client = genai.Client(api_key=key.strip())
                except Exception:
                    try:
                        # Fallback to google.generativeai
                        import google.generativeai as genai_old
                        genai_old.configure(api_key=key.strip())
                        self._gemini_client = genai_old
                    except Exception as e:
                        logger.warning(f"Failed to initialize Gemini client: {e}")
        return self._gemini_client

    def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = NAGRIKMITRA_SYSTEM_PROMPT,
        temperature: float = 0.3,
        context_docs: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes chat completion with automatic failover across Groq -> Gemini -> Local Fallback.
        """
        augmented_system = system_prompt
        if context_docs:
            augmented_system += f"\n\n--- OFFICIAL VERIFIED SCHEME CONTEXT ---\n{context_docs}\n----------------------------------------\nAnswer the citizen's query using the above scheme context."

        # Tier 1: Try Groq API
        groq_client = self._get_groq_client()
        if groq_client:
            for model_name in [settings.GROQ_MODEL, settings.GROQ_FALLBACK_MODEL]:
                try:
                    groq_messages = [{"role": "system", "content": augmented_system}] + messages
                    response = groq_client.chat.completions.create(
                        model=model_name,
                        messages=groq_messages,
                        temperature=temperature,
                        max_tokens=1024
                    )
                    content = response.choices[0].message.content
                    if content and content.strip():
                        return {
                            "content": content.strip(),
                            "provider": "groq",
                            "model": model_name,
                            "tier": 1
                        }
                except Exception as e:
                    logger.warning(f"Groq ({model_name}) request failed: {e}. Attempting fallback...")

        # Tier 2: Try Google Gemini API
        gemini_client = self._get_gemini_client()
        if gemini_client:
            try:
                # Format full prompt
                conversation_text = ""
                for m in messages:
                    role_label = "User" if m["role"] == "user" else "Assistant"
                    conversation_text += f"{role_label}: {m['content']}\n"

                full_prompt = f"{augmented_system}\n\n{conversation_text}\nAssistant:"

                if hasattr(gemini_client, "models"):
                    # google.genai Client
                    response = gemini_client.models.generate_content(
                        model=settings.GEMINI_MODEL,
                        contents=full_prompt
                    )
                    content = response.text
                else:
                    # google.generativeai
                    model = gemini_client.GenerativeModel(settings.GEMINI_MODEL)
                    response = model.generate_content(full_prompt)
                    content = response.text

                if content and content.strip():
                    return {
                        "content": content.strip(),
                        "provider": "gemini",
                        "model": settings.GEMINI_MODEL,
                        "tier": 2
                    }
            except Exception as e:
                logger.warning(f"Gemini request failed: {e}. Attempting tier 3 fallback...")

        # Tier 3: Local Grounded Synthesizer (Offline Fallback)
        last_user_query = ""
        for m in reversed(messages):
            if m["role"] == "user":
                last_user_query = m["content"]
                break

        fallback_response = self._synthesize_local_fallback(last_user_query, context_docs)
        return {
            "content": fallback_response,
            "provider": "local_grounded_fallback",
            "model": "rule_based_knowledge_synthesizer",
            "tier": 3
        }

    def _synthesize_local_fallback(self, query: str, context_docs: Optional[str]) -> str:
        """Grounded offline response generator when external LLM APIs are unreachable."""
        is_hindi = any('\u0900' <= c <= '\u097f' for c in query)

        if not context_docs or not context_docs.strip():
            if is_hindi:
                return (
                    "नमस्ते! मैं नागरिक मित्र (NagrikMitra) हूँ। "
                    "कृपया मुझे अपनी उम्र, राज्य, पेशा (जैसे किसान, छात्र), और वार्षिक आय बताएं ताकि मैं आपके लिए सबसे सही सरकारी योजनाएं खोज सकूँ।"
                )
            return (
                "Hello! I am NagrikMitra (Citizen's Friend). "
                "Please tell me your age, state of residence, occupation (e.g., farmer, student), and annual income so I can discover the best government welfare schemes for you."
            )

        # If we have RAG context docs, synthesize a structured grounded summary
        lines = context_docs.strip().split("\n")
        scheme_names = []
        for line in lines:
            if line.startswith("Scheme Name:"):
                scheme_names.append(line.replace("Scheme Name:", "").strip())

        unique_schemes = list(dict.fromkeys(scheme_names))[:3]
        schemes_list_str = "\n".join([f"• **{name}**" for name in unique_schemes])

        if is_hindi:
            return (
                f"नमस्ते! आपके प्रश्न के आधार पर सरकारी योजनाओं की जानकारी नीचे दी गई है:\n\n"
                f"{schemes_list_str}\n\n"
                f"विस्तृत जानकारी:\n{context_docs[:600]}...\n\n"
                f"💡 आवेदन करने के लिए आवश्यक दस्तावेज़ तैयार रखें और संबंधित सरकारी पोर्टल पर जाएँ।"
            )
        else:
            return (
                f"Hello! Based on official government guidelines, here are the relevant schemes matching your query:\n\n"
                f"{schemes_list_str}\n\n"
                f"Details from guidelines:\n{context_docs[:600]}...\n\n"
                f"💡 Please verify your documents and apply via the official government portal links provided."
            )

    def extract_profile_slots(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured demographic entities from conversational utterance.
        Uses LLM with fallback to regex/keyword parser.
        """
        # Always run regex parser first as baseline
        regex_profile = parse_profile_regex_fallback(text)

        # Attempt LLM extraction for higher fidelity
        extraction_prompt = f"""Extract demographic profile attributes from this user message: "{text}".
Return ONLY a valid JSON object with these keys (use null if not mentioned):
{{
  "age": null,
  "gender": null,
  "state": null,
  "caste_category": null,
  "annual_income": null,
  "residence": null,
  "is_bpl": null,
  "has_disability": null,
  "occupation": null
}}
JSON:"""

        try:
            res = self.generate_chat_completion(
                messages=[{"role": "user", "content": extraction_prompt}],
                system_prompt="You are a strict data extraction parser. Return ONLY valid JSON.",
                temperature=0.0
            )
            # Find JSON inside content
            match = re.search(r'\{.*\}', res["content"], re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                # Merge with regex baseline, giving precedence to valid non-null LLM values
                for k, v in parsed.items():
                    if v is not None and v != "":
                        regex_profile[k] = v
        except Exception:
            pass

        return regex_profile

# Global singleton client
llm_client = MultiTierLLMClient()
