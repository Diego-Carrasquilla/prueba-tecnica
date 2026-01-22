// Configuración de la API de Railway
const API_URL = import.meta.env.VITE_API_URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

export interface CreateTicketRequest {
    description: string
}

export interface CreateTicketResponse {
    id: string
    description: string
    category?: string
    sentiment?: string
    processed: boolean
    message: string
}

export interface ApiError {
    detail: string
}

/**
 * Envía notificación al webhook de n8n
 */
async function sendWebhookNotification(ticket: CreateTicketResponse): Promise<void> {
    if (!N8N_WEBHOOK_URL) {
        console.warn('N8N webhook URL not configured')
        return
    }

    try {
        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'ticket_created',
                ticket: {
                    id: ticket.id,
                    description: ticket.description,
                    category: ticket.category,
                    sentiment: ticket.sentiment,
                },
                timestamp: new Date().toISOString(),
            }),
        })
    } catch (error) {
        // Log error but don't throw - notification failure shouldn't block ticket creation
        console.warn('Failed to send webhook notification:', error)
    }
}

/**
 * Crea un nuevo ticket usando la API de Railway
 */
export async function createTicket(description: string): Promise<CreateTicketResponse> {
    try {
        const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
        })

        if (!response.ok) {
            const error: ApiError = await response.json()
            throw new Error(error.detail || 'Error al crear el ticket')
        }

        const ticket = await response.json()

        // Enviar notificación al webhook de n8n
        sendWebhookNotification(ticket)

        return ticket
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Error de conexión con el servidor')
    }
}

/**
 * Verifica el estado de la API
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/health`)
        return response.ok
    } catch {
        return false
    }
}
