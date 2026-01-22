from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Any, List
from enum import Enum


# Enums for Type Safety
class TicketCategory(str, Enum):
    TECNICO = "Técnico"
    FACTURACION = "Facturación"
    COMERCIAL = "Comercial"


class TicketSentiment(str, Enum):
    POSITIVO = "Positivo"
    NEUTRAL = "Neutral"
    NEGATIVO = "Negativo"


# Resultado estructurado del análisis LLM
class TicketAnalysis(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    
    category: TicketCategory = Field(
        description="Ticket category: Técnico, Facturación, or Comercial"
    )
    sentiment: TicketSentiment = Field(
        description="Sentiment: Positivo, Neutral, or Negativo"
    )
    confidence: float = Field(
        description="Confidence score between 0 and 1",
        ge=0.0,
        le=1.0
    )


# Modelo de entrada para crear tickets
class CreateTicketRequest(BaseModel):
    description: str = Field(
        ..., 
        min_length=5,
        max_length=2000,
        description="Ticket description text"
    )
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty or whitespace only")
        return v


# Modelo de entrada para procesar tickets
class ProcessTicketRequest(BaseModel):
    ticket_id: str = Field(
        ...,
        description="ID of the existing ticket to process"
    )


# Modelo de respuesta para tickets procesados
class TicketResponse(BaseModel):
    id: str
    description: str
    category: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[float] = None
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
