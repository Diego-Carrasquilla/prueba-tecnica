"""Supabase database client initialization"""

from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY, logger, ConfigurationError


def get_supabase_client() -> Client:
    """
    Crea y retorna un cliente de Supabase configurado.
    
    Returns:
        Cliente de Supabase inicializado
        
    Raises:
        ConfigurationError: Si falla la inicialización
    """
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized")
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise ConfigurationError(f"Supabase initialization failed: {e}")
