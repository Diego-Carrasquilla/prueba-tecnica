import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")

# Modelo por defecto para generación de texto / chat en Hugging Face
HUGGINGFACE_MODEL = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-3.2-1B-Instruct")

# API Configuration (para el cliente de Hugging Face)
HF_API_TOKEN = HUGGINGFACE_API_TOKEN
HF_MODEL_ID = HUGGINGFACE_MODEL

# n8n Webhook Configuration
N8N_WEBHOOK_TEST = "https://n8n.srv1241518.hstgr.cloud/webhook-test/a7978e25-8e19-483e-bf37-be6349ac8391"
N8N_WEBHOOK_PROD = "https://n8n.srv1241518.hstgr.cloud/webhook/a7978e25-8e19-483e-bf37-be6349ac8391"

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://prueba-tecnica-git-main-diego-carrasquillas-projects.vercel.app",
    "https://prueba-tecnica-seven-cyan.vercel.app",
    # "*"  # SECURITY: Wildcard disabled for production. Use specific domain instead.
]


class ConfigurationError(Exception):
    """Raised when required configuration is missing"""
    pass


def validate_configuration() -> None:
    """Validates that all required environment variables are set"""
    required_vars = {
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_KEY": SUPABASE_KEY,
        "HUGGINGFACE_API_TOKEN": HUGGINGFACE_API_TOKEN
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ConfigurationError(error_msg)
    
    logger.info("Configuration validated successfully")
