import { createClient } from '@supabase/supabase-js'

// Tipos de datos de Supabase
export type TicketCategory = 'Técnico' | 'Facturación' | 'Comercial'
export type TicketSentiment = 'Positivo' | 'Neutral' | 'Negativo'

export interface Ticket {
    id: string
    created_at: string
    description: string
    category: TicketCategory
    sentiment: TicketSentiment
    processed: boolean
}

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Faltan las variables de entorno de Supabase')
    console.error('Por favor, crea un archivo .env con:')
    console.error('VITE_SUPABASE_URL=tu_url_de_supabase')
    console.error('VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase')
}

// Crear cliente de Supabase sin tipos genéricos para evitar conflictos con Realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // No persistir sesión para dashboard público
    },
    realtime: {
        params: {
            eventsPerSecond: 10, // Límite de eventos por segundo
        },
    },
})
