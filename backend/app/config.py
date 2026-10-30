from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
from pathlib import Path

_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    APP_NAME: str = "NagrikMitra"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql://postgres:3kU9JGriasO36Uhl@db.xgddzjmnonafijgxmefz.supabase.co:5432/postgres"
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"
    
    # Authorized CORS origins for production and development
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Supabase Cloud & Authentication
    SUPABASE_URL: Optional[str] = "https://xgddzjmnonafijgxmefz.supabase.co"
    SUPABASE_JWT_SECRET: Optional[str] = "69P6LSg8munHOvwNi3adYMXbPwBgNx+N2YBv/dP8ZhFhjbucDkac3FAiXe4/PdWkDzGKEiZyXv8L9u74+raD1Q=="

    # LLM Provider Configuration with Fallback Hierarchy
    PRIMARY_LLM_PROVIDER: str = "gemini"  # "groq" -> "gemini" -> "local"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"
    
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=(".env", str(_ENV_PATH)),
        extra="ignore"
    )

settings = Settings()
