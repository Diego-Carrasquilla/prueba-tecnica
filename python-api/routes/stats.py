"""Statistics endpoint"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
from supabase import Client

from config import logger

router = APIRouter(tags=["Statistics"])


def setup_routes(supabase: Client) -> APIRouter:
    """Configure statistics routes with database client"""
    
    @router.get("/stats")
    async def get_statistics() -> Dict[str, Any]:
        """Obtiene estadísticas de tickets"""
        try:
            logger.info("Fetching ticket statistics")
            
            response = supabase.rpc("get_ticket_stats").execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            
            logger.warning("No statistics data available")
            return {
                "message": "No statistics available",
                "total_tickets": 0
            }
            
        except Exception as e:
            logger.error(f"Error fetching statistics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch statistics: {str(e)}"
            )
    
    return router
