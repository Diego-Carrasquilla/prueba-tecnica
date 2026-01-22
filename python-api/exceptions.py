"""Custom exceptions for the ticket processing API"""


class TicketProcessingError(Exception):
    """Base exception for ticket processing errors"""
    pass


class LLMAnalysisError(TicketProcessingError):
    """Raised when LLM analysis fails"""
    pass


class DatabaseError(TicketProcessingError):
    """Raised when database operations fail"""
    pass
