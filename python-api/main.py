"""
Ticket Processing API - Main Application
FastAPI application for AI-powered ticket categorization and sentiment analysis
"""

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from config import validate_configuration, CORS_ORIGINS, logger
from database import get_supabase_client
from exceptions import TicketProcessingError, LLMAnalysisError, DatabaseError
from routes import health, tickets, stats

# Validate configuration on startup
validate_configuration()

# Initialize FastAPI app
app = FastAPI(
    title="Ticket Processing API",
    description="AI-powered ticket categorization and sentiment analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase = get_supabase_client()

# Custom exception handler
@app.exception_handler(TicketProcessingError)
async def ticket_processing_error_handler(request, exc: TicketProcessingError):
    """Handle custom ticket processing errors"""
    error_type = type(exc).__name__
    logger.error(f"{error_type}: {str(exc)}")
    
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    if isinstance(exc, LLMAnalysisError):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif isinstance(exc, DatabaseError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": str(exc),
            "error_type": error_type,
            "detail": "An error occurred while processing the ticket"
        }
    )

# Register routes
app.include_router(health.router)
app.include_router(tickets.setup_routes(supabase))
app.include_router(stats.setup_routes(supabase))

logger.info("Application initialized successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


