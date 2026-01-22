"""Health check endpoint"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(tags=["Health"])


@router.get("/")
def read_root() -> Dict[str, Any]:
    """Health check endpoint with API information"""
    return {
        "status": "healthy",
        "message": "Ticket Processing API",
        "version": "1.0.0",
        "endpoints": {
            "POST /tickets": "Create new ticket and notify n8n",
            "POST /process-ticket": "Process ticket with AI analysis",
            "GET /tickets": "List all tickets with filters",
            "GET /tickets/{ticket_id}": "Get ticket by ID",
            "GET /stats": "Get ticket statistics"
        }
    }
