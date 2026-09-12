from app.services.llm_client import llm_client, NAGRIKMITRA_SYSTEM_PROMPT

# Backwards compatible alias pointing to our multi-tier fallback architecture
gemini_client = llm_client
