from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "NagrikMitra"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./data/nagrikmitra.db"
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"
    
    # LLM Provider Configuration with Fallback Hierarchy
    PRIMARY_LLM_PROVIDER: str = "groq"  # "groq" -> "gemini" -> "local"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"
    
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
