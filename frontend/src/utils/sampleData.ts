// Script de ejemplo para insertar tickets de prueba en Supabase
// Usa este script en la consola del navegador o en un archivo Node.js

import { supabase, type TicketCategory, type TicketSentiment } from '../lib/supabase'

interface SampleTicket {
    description: string
    category: TicketCategory
    sentiment: TicketSentiment
}

const sampleTickets: SampleTicket[] = [
    {
        description: 'Mi conexión a internet está muy lenta desde hace dos días. He reiniciado el router varias veces pero el problema persiste.',
        category: 'Técnico',
        sentiment: 'Negativo',
    },
    {
        description: 'Necesito información sobre los planes empresariales disponibles. ¿Tienen descuentos por volumen?',
        category: 'Comercial',
        sentiment: 'Neutral',
    },
    {
        description: 'Recibí mi factura y todo está perfecto. Gracias por el excelente servicio.',
        category: 'Facturación',
        sentiment: 'Positivo',
    },
    {
        description: 'No puedo acceder a mi panel de administración. Me sale un error 500.',
        category: 'Técnico',
        sentiment: 'Negativo',
    },
    {
        description: 'Me gustaría actualizar mi plan al siguiente nivel. ¿Cuál es el proceso?',
        category: 'Comercial',
        sentiment: 'Positivo',
    },
    {
        description: 'En mi última factura aparece un cargo que no reconozco. ¿Pueden revisarlo?',
        category: 'Facturación',
        sentiment: 'Neutral',
    },
    {
        description: 'El servicio funciona excelente. Muy satisfecho con la calidad.',
        category: 'Técnico',
        sentiment: 'Positivo',
    },
    {
        description: '¿Tienen planes especiales para startups? Estamos interesados en contratar.',
        category: 'Comercial',
        sentiment: 'Positivo',
    },
]

// Función para insertar tickets de prueba
export async function insertSampleTickets(): Promise<void> {
    console.log('Insertando tickets de prueba...')

    for (const ticket of sampleTickets) {
        const { data, error } = await (supabase as any)
            .from('tickets')
            .insert([ticket])
            .select()

        if (error) {
            console.error('Error al insertar ticket:', error)
        } else if (data && data.length > 0) {
            console.log('✓ Ticket insertado:', data[0].id)
        }

        // Esperar un poco entre inserciones para ver el efecto realtime
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('✅ Todos los tickets de prueba han sido insertados')
}

// Para usar en la consola del navegador:
// 1. Importa este módulo
// 2. Ejecuta: insertSampleTickets()

export default sampleTickets
