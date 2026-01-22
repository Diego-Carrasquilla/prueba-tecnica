"""Ticket management endpoints"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional, Dict, Any
from supabase import Client

from models import (
    CreateTicketRequest,
    ProcessTicketRequest,
    TicketResponse,
    TicketListResponse
)
from exceptions import DatabaseError, LLMAnalysisError
from analyzer import analyze_ticket
from webhooks import notify_n8n_webhooks
from config import logger

router = APIRouter(tags=["Tickets"])


def setup_routes(supabase: Client) -> APIRouter:
    """Configure ticket routes with database client"""
    
    @router.post(
        "/tickets",
        response_model=TicketResponse,
        status_code=status.HTTP_201_CREATED
    )
    async def create_ticket(ticket: CreateTicketRequest) -> TicketResponse:
        """
        Crea un nuevo ticket en estado pendiente y envía notificaciones a n8n.
        n8n luego llamará a /process-ticket para procesar el ticket con IA.
        """
        try:
            logger.info(f"Creating new ticket: {ticket.description[:50]}...")
            
            # Insertar ticket en Supabase sin procesar
            try:
                response = supabase.table("tickets").insert({
                    "description": ticket.description,
                    "processed": False,
                    "status": "pending"
                }).execute()
                
                if not response.data:
                    raise DatabaseError("Database insert returned no data")
                
                ticket_data = response.data[0]
                logger.info(f"Ticket created successfully: {ticket_data['id']}")
                
            except Exception as e:
                logger.error(f"Database error: {e}")
                raise DatabaseError(f"Failed to create ticket: {str(e)}")
            
            # Enviar notificaciones a webhooks de n8n
            notify_n8n_webhooks({
                "ticket_id": ticket_data["id"],
                "description": ticket_data["description"],
                "created_at": ticket_data["created_at"],
                "status": ticket_data["status"]
            })
            
            return TicketResponse(
                id=ticket_data["id"],
                description=ticket_data["description"],
                category=ticket_data.get("category", ""),
                sentiment=ticket_data.get("sentiment", ""),
                processed=ticket_data["processed"],
                message="Ticket created successfully and n8n notified"
            )
            
        except DatabaseError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in create_ticket: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}"
            )

    @router.post(
        "/process-ticket",
        response_model=TicketResponse,
        status_code=status.HTTP_200_OK
    )
    async def process_ticket(ticket: ProcessTicketRequest) -> TicketResponse:
        """Procesa ticket con IA - analiza categoría y sentimiento, actualiza BD"""
        try:
            logger.info(f"Processing existing ticket {ticket.ticket_id}...")
            
            # Fetch ticket from database to get description
            try:
                ticket_query = supabase.table("tickets").select("*").eq("id", ticket.ticket_id).execute()
                
                if not ticket_query.data:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Ticket with ID {ticket.ticket_id} not found"
                    )
                
                ticket_data = ticket_query.data[0]
                description = ticket_data.get("description", "")
                
                if not description or not description.strip():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ticket has no description to process"
                    )
                    
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error fetching ticket: {e}")
                raise DatabaseError(f"Failed to fetch ticket: {str(e)}")
            
            # Check if ticket is already processed (idempotency)
            if ticket_data.get("processed", False):
                logger.info(f"Ticket {ticket.ticket_id} already processed, returning cached result")
                return TicketResponse(
                    id=ticket.ticket_id,
                    description=description,
                    category=ticket_data.get("category"),
                    sentiment=ticket_data.get("sentiment"),
                    confidence=ticket_data.get("confidence"),
                    processed=True,
                    message="Ticket already processed (idempotent response)"
                )
            
            # Mark as processing
            try:
                supabase.table("tickets").update({"status": "processing"}).eq("id", ticket.ticket_id).execute()
                logger.info(f"Ticket {ticket.ticket_id} marked as processing")
            except Exception as e:
                logger.warning(f"Failed to mark ticket as processing: {e}")
            
            # Analyze with AI
            try:
                analysis = analyze_ticket(description)
            except Exception as e:
                # Mark as error if analysis fails
                try:
                    supabase.table("tickets").update({"status": "error"}).eq("id", ticket.ticket_id).execute()
                except Exception:
                    pass
                raise LLMAnalysisError(f"Analysis failed: {str(e)}")
            
            # Update existing ticket in database
            try:
                update_data = {
                    "category": analysis.category,
                    "sentiment": analysis.sentiment,
                    "confidence": analysis.confidence,
                    "processed": True,
                    "status": "done"
                }
                
                response = supabase.table("tickets").update(update_data).eq("id", ticket.ticket_id).execute()
                
                if not response.data:
                    raise DatabaseError(f"Ticket with ID {ticket.ticket_id} not found or update failed")
                
                ticket_data = response.data[0]
                logger.info(f"Ticket updated successfully: {ticket_data['id']}")
                
            except Exception as e:
                # Mark as error if update fails
                try:
                    supabase.table("tickets").update({"status": "error"}).eq("id", ticket.ticket_id).execute()
                except Exception:
                    pass
                logger.error(f"Database error: {e}")
                raise DatabaseError(f"Failed to update ticket: {str(e)}")
            
            return TicketResponse(
                id=ticket_data["id"],
                description=ticket_data["description"],
                category=ticket_data["category"],
                sentiment=ticket_data["sentiment"],
                confidence=ticket_data.get("confidence"),
                processed=ticket_data["processed"],
                message="Ticket processed and updated successfully"
            )
            
        except LLMAnalysisError:
            raise
        except DatabaseError:
            raise
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in process_ticket: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}"
            )

    @router.get("/tickets", response_model=TicketListResponse)
    async def get_tickets(
        limit: int = Query(default=100, ge=1, le=1000),
        processed: Optional[bool] = None
    ) -> TicketListResponse:
        """Obtiene lista de tickets con filtros opcionales"""
        try:
            logger.info(f"Fetching tickets: limit={limit}, processed={processed}")
            
            query = supabase.table("tickets").select("*").order("created_at", desc=True).limit(limit)
            
            if processed is not None:
                query = query.eq("processed", processed)
            
            response = query.execute()
            
            return TicketListResponse(
                tickets=response.data,
                count=len(response.data),
                limit=limit
            )
            
        except Exception as e:
            logger.error(f"Error fetching tickets: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch tickets: {str(e)}"
            )

    @router.get("/tickets/{ticket_id}")
    async def get_ticket(ticket_id: str) -> Dict[str, Any]:
        """Obtiene un ticket específico por ID"""
        try:
            logger.info(f"Fetching ticket: {ticket_id}")
            
            response = supabase.table("tickets").select("*").eq("id", ticket_id).execute()
            
            if not response.data:
                logger.warning(f"Ticket not found: {ticket_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ticket with ID {ticket_id} not found"
                )
            
            return response.data[0]
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching ticket {ticket_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch ticket: {str(e)}"
            )
    
    return router
