from fastapi import FastAPI, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Literal, Optional, Dict, Any, List
from enum import Enum
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from huggingface_hub import InferenceClient
import json

load_dotenv()

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enums for Type Safety
class TicketCategory(str, Enum):
    TECNICO = "Técnico"
    FACTURACION = "Facturación"
    COMERCIAL = "Comercial"

class TicketSentiment(str, Enum):
    POSITIVO = "Positivo"
    NEUTRAL = "Neutral"
    NEGATIVO = "Negativo"

# Excepciones personalizadas
class TicketProcessingError(Exception):
    pass

class LLMAnalysisError(TicketProcessingError):
    pass

class DatabaseError(TicketProcessingError):
    pass

class ConfigurationError(TicketProcessingError):
    pass

# Validación de configuración - verifica variables de entorno requeridas
def validate_configuration() -> None:
    required_vars = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
        "HUGGINGFACE_API_TOKEN": os.getenv("HUGGINGFACE_API_TOKEN")
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ConfigurationError(error_msg)
    
    logger.info("Configuration validated successfully")

validate_configuration()

app = FastAPI(
    title="Ticket Processing API",
    description="AI-powered ticket categorization and sentiment analysis",
    version="1.0.0"
)

# Configuración CORS para permitir requests desde Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "*"  # En producción, especifica tu dominio de Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client
try:
    supabase: Client = create_client(
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_KEY", "")
    )
    logger.info("Supabase client initialized")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    raise ConfigurationError(f"Supabase initialization failed: {e}")

# LLM Configuration - usando Inference API de Hugging Face
try:
    hf_client = InferenceClient(
        token=os.getenv("HUGGINGFACE_API_TOKEN", "")
    )
    logger.info("Hugging Face client initialized")
except Exception as e:
    logger.error(f"Failed to initialize HF client: {e}")
    raise ConfigurationError(f"HF client initialization failed: {e}")


# Modelos Pydantic
# Resultado estructurado del análisis LLM
class TicketAnalysis(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    category: TicketCategory = Field(
        description="Ticket category: Técnico, Facturación, or Comercial"
    )
    sentiment: TicketSentiment = Field(
        description="Sentiment: Positivo, Neutral, or Negativo"
    )


# Modelo de entrada para procesar tickets
class TicketRequest(BaseModel):
    description: str = Field(
        ..., 
        min_length=5,
        max_length=2000,
        description="Ticket description text"
    )
    
    # Validador - limpia y valida la descripción
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty or whitespace only")
        return v


# Modelo de respuesta para tickets procesados
class TicketResponse(BaseModel):
    id: str
    description: str
    category: str
    sentiment: str
    processed: bool
    message: str


# Modelo de respuesta de errores
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    error_type: str


# Modelo de respuesta para lista de tickets
class TicketListResponse(BaseModel):
    tickets: List[Dict[str, Any]]
    count: int
    limit: int


# Función de análisis - procesa ticket con LLM y retorna categoría y sentimiento
def analyze_ticket_with_llm(description: str) -> TicketAnalysis:
    try:
        # Prompt optimizado
        prompt = f"""Analyze ticket. Output JSON only.

Categories:
- Técnico: tech issues, bugs, system errors
- Facturación: billing, payments, invoices
- Comercial: sales, products, inquiries

Sentiment:
- Positivo: satisfied, grateful
- Neutral: informative
- Negativo: frustrated, angry

Ticket: {description}

Output JSON with keys: category, sentiment"""
        
        logger.info(f"Analyzing ticket: {description[:50]}...")
        
        # Llamada a la API de Hugging Face
        response = hf_client.text_generation(
            prompt,
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            max_new_tokens=100,
            temperature=0.1
        )
        
        # Extraer JSON de la respuesta
        try:
            # Buscar JSON en la respuesta
            response_text = response.strip()
            if '{' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                json_str = response_text[json_start:json_end]
                result_dict = json.loads(json_str)
                
                result = TicketAnalysis(
                    category=result_dict.get("category", "Comercial"),
                    sentiment=result_dict.get("sentiment", "Neutral")
                )
            else:
                # Fallback si no hay JSON
                result = TicketAnalysis(category="Comercial", sentiment="Neutral")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse JSON, using defaults: {e}")
            result = TicketAnalysis(category="Comercial", sentiment="Neutral")
        
        logger.info(f"Analysis complete: {result.category}, {result.sentiment}")
        return result
        
    except Exception as e:
        logger.error(f"LLM analysis failed: {e}")
        raise LLMAnalysisError(f"LLM analysis error: {str(e)}")


# Manejador de errores personalizado
@app.exception_handler(TicketProcessingError)
async def ticket_processing_error_handler(request, exc: TicketProcessingError):
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


# Endpoints de la API
# Health check - verifica estado de la API
@app.get("/", tags=["Health"])
def read_root() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "message": "Ticket Processing API",
        "version": "1.0.0",
        "endpoints": {
            "POST /process-ticket": "Process ticket with AI analysis",
            "GET /tickets": "List all tickets with filters",
            "GET /tickets/{ticket_id}": "Get ticket by ID",
            "GET /stats": "Get ticket statistics"
        }
    }


# Procesa ticket con IA - analiza categoría y sentimiento, guarda en BD
@app.post(
    "/process-ticket",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Tickets"]
)
async def process_ticket(ticket: TicketRequest) -> TicketResponse:
    try:
        logger.info(f"Processing new ticket: {ticket.description[:50]}...")
        
        # Analyze with LLM
        analysis = analyze_ticket_with_llm(ticket.description)
        
        # Save to database
        try:
            response = supabase.table("tickets").insert({
                "description": ticket.description,
                "category": analysis.category,
                "sentiment": analysis.sentiment,
                "processed": True
            }).execute()
            
            if not response.data:
                raise DatabaseError("Database insert returned no data")
            
            ticket_data = response.data[0]
            logger.info(f"Ticket saved successfully: {ticket_data['id']}")
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            raise DatabaseError(f"Failed to save ticket: {str(e)}")
        
        return TicketResponse(
            id=ticket_data["id"],
            description=ticket_data["description"],
            category=ticket_data["category"],
            sentiment=ticket_data["sentiment"],
            processed=ticket_data["processed"],
            message="Ticket processed and saved successfully"
        )
        
    except LLMAnalysisError:
        raise
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in process_ticket: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


# Obtiene lista de tickets con filtros opcionales
@app.get("/tickets", response_model=TicketListResponse, tags=["Tickets"])
async def get_tickets(
    limit: int = Query(default=100, ge=1, le=1000),
    processed: Optional[bool] = None
) -> TicketListResponse:
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


# Obtiene un ticket específico por ID
@app.get("/tickets/{ticket_id}", tags=["Tickets"])
async def get_ticket(ticket_id: str) -> Dict[str, Any]:
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

# Obtiene estadísticas de tickets
@app.get("/stats", tags=["Statistics"])
async def get_statistics() -> Dict[str, Any]:
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
