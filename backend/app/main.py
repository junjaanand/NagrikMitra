from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.config import settings
from app.routes import schemes, eligibility, chat, ocr

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema on startup
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="NagrikMitra (नागरिक मित्र) Backend API - Intelligent Government Scheme Discovery & Citizen Assistance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

# Include modular API routers
app.include_router(schemes.router, prefix="/api/schemes", tags=["Schemes"])
app.include_router(eligibility.router, prefix="/api/eligibility", tags=["Eligibility"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
