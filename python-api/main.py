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
import requests
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

# LLM Configuration - API directa de Hugging Face
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
logger.info("Hugging Face API configured")


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
        logger.info(f"Analyzing ticket: {description[:50]}...")
        
        # Prompt mejorado - específico con criterios claros
        prompt = f"""Analiza este ticket de soporte:

"{description}"

CATEGORÍA:
- Técnico: errores, bugs, fallos de sistema, problemas de conexión/acceso, internet, aplicación no funciona
- Facturación: pagos, facturas, cobros, precios, reembolsos, cargos, suscripciones
- Comercial: consultas de ventas, información de productos/servicios, cotizaciones

SENTIMIENTO (crucial detectar emociones):
- Negativo: frustración, enojo, quejas, urgencia, problemas serios, expresiones de molestia ("increíble", "no puede ser", "días sin"), tono de reclamo
- Positivo: satisfacción, agradecimiento, elogios, palabras como "excelente/genial/perfecto/super/mejor/bien/gracias"
- Neutral: solo información, sin emoción clara

Responde: categoria:X sentimiento:Y"""
        
        # Llamada a la API de Hugging Face
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 50,
                "temperature": 0.2,
                "return_full_text": False
            }
        }
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            logger.warning(f"HF API returned {response.status_code}, using keyword fallback")
            return analyze_with_keywords(description)
        
        result_text = response.json()[0].get('generated_text', '').lower()
        logger.info(f"LLM response: {result_text[:100]}")
        
        # Extraer categoría - orden importa (negativo antes que neutral)
        category = "Comercial"
        if "técnico" in result_text or "tecnico" in result_text or "technical" in result_text:
            category = "Técnico"
        elif "facturación" in result_text or "facturacion" in result_text or "billing" in result_text or "pago" in result_text:
            category = "Facturación"
        elif "comercial" in result_text or "sales" in result_text or "venta" in result_text:
            category = "Comercial"
        
        # Extraer sentimiento - priorizar negativo
        sentiment = "Neutral"
        if "negativo" in result_text or "negative" in result_text or "enojo" in result_text or "frustr" in result_text:
            sentiment = "Negativo"
        elif "positivo" in result_text or "positive" in result_text or "satisf" in result_text:
            sentiment = "Positivo"
        else:
            sentiment = "Neutral"
        
        result = TicketAnalysis(category=category, sentiment=sentiment)
        logger.info(f"Analysis complete: {result.category}, {result.sentiment}")
        return result
        
    except Exception as e:
        logger.warning(f"LLM failed ({e}), using keyword fallback")
        return analyze_with_keywords(description)


def analyze_with_keywords(description: str) -> TicketAnalysis:
    """Análisis basado en palabras clave con scoring"""
    text = description.lower()
    
    # Keywords para categorías
    tech_words = ["error", "bug", "crash", "fallo", "falla", "no funciona", "no carga", "no abre", 
                  "problema técnico", "internet", "conexión", "conectar", "sistema caído", "sin servicio",
                  "lento", "pantalla", "login", "contraseña", "acceso", "technical", "broken"]
    billing_words = ["pago", "factura", "cobro", "cargo", "precio", "reembolso", "devoluci", "billing",
                     "tarjeta", "cuenta", "suscripción", "plan", "costo", "monto", "dinero"]
    
    # Keywords para sentimientos - con intensificadores
    negative_words = ["molesto", "horrible", "mal", "frustrado", "enojado", "inaceptable", "terrible",
                      "pésimo", "desastr", "urgente", "increíble", "no puede ser", "días sin", "semanas",
                      "nunca", "siempre falla", "harto", "cansado", "indignado", "reclamo", "queja",
                      "disappointed", "angry", "worst", "awful", "hate"]
    positive_words = ["excelente", "genial", "gracias", "perfecto", "contento", "feliz", "satisfecho",
                      "funciona bien", "rápido", "eficiente", "bueno", "great", "excellent", "thanks",
                      "amazing", "love", "fantastic", "bien", "super", "mejor", "mejores", "buen",
                      "increíble trabajo", "fantástico", "maravilloso", "encantado", "agradecido"]
    
    # Scoring de categorías
    tech_score = sum(1 for word in tech_words if word in text)
    billing_score = sum(1 for word in billing_words if word in text)
    
    if tech_score > billing_score:
        category = "Técnico"
    elif billing_score > 0:
        category = "Facturación"
    else:
        category = "Comercial"
    
    # Scoring de sentimiento con intensificadores
    negative_score = sum(2 if word in text else 0 for word in negative_words)
    positive_score = sum(2 if word in text else 0 for word in positive_words)
    
    # Intensificadores de negatividad
    negative_intensifiers = ["increíble que", "no puede ser", "días sin", "semanas sin", "nunca funciona", "siempre falla", "!!!"]
    if any(intensifier in text for intensifier in negative_intensifiers):
        negative_score += 3
    
    # Intensificadores de positividad
    positive_intensifiers = ["super", "muy bien", "los mejores", "el mejor", "muy bueno", "súper"]
    if any(intensifier in text for intensifier in positive_intensifiers):
        positive_score += 3
    
    if negative_score > positive_score and negative_score > 0:
        sentiment = "Negativo"
    elif positive_score > 0:
        sentiment = "Positivo"
    else:
        sentiment = "Neutral"
    
    return TicketAnalysis(category=category, sentiment=sentiment)


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
