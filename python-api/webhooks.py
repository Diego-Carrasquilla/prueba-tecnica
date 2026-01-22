"""Webhook notification logic for n8n integration"""

import requests
from typing import Dict, Any
from config import logger, N8N_WEBHOOK_TEST, N8N_WEBHOOK_PROD


def notify_n8n_webhooks(ticket_data: Dict[str, Any]) -> None:
    """
    Envía notificación de nuevo ticket a los webhooks de n8n.
    
    Args:
        ticket_data: Diccionario con los datos del ticket creado
    """
    webhooks = [N8N_WEBHOOK_TEST, N8N_WEBHOOK_PROD]
    
    for webhook_url in webhooks:
        try:
            response = requests.post(
                webhook_url,
                json=ticket_data,
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code in [200, 201, 204]:
                logger.info(f"Webhook notification sent successfully to {webhook_url}")
            else:
                logger.warning(f"Webhook {webhook_url} returned status {response.status_code}")
        except Exception as e:
            logger.error(f"Failed to send webhook notification to {webhook_url}: {e}")
            # No lanzamos excepción para que un webhook fallido no impida el proceso
