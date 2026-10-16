import sys
import logging
# Bypass Windows Application Control DLL block on optional pandas dependency in pytesseract
if 'pandas' not in sys.modules:
    sys.modules['pandas'] = None

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.config import settings
from app.routes import schemes, eligibility, chat, ocr

logger = logging.getLogger("NagrikMitra.API")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema on startup
    logger.info("Initializing NagrikMitra database schema...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    # Graceful shutdown handler
    logger.info("NagrikMitra API service shutting down cleanly.")

app = FastAPI(
    title=settings.APP_NAME,
    description="NagrikMitra (नागरिक मित्र) Backend API - Intelligent Government Scheme Discovery & Citizen Assistance",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Production-hardened CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

# Global unhandled exception handler to prevent traceback leakage
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred while processing your request. Please try again later.",
            "path": request.url.path
        }
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
