import { useState, useEffect } from 'react'
import { supabase, Ticket } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseTicketsReturn {
    tickets: Ticket[]
    loading: boolean
    error: string | null
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
    refetch: () => Promise<void>
}

/**
 * Hook personalizado para manejar tickets con Supabase Realtime
 */
export const useTickets = (): UseTicketsReturn => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

    // Función para cargar tickets
    const loadTickets = async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setTickets(data || [])
        } catch (err) {
            console.error('Error al cargar tickets:', err)
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Cargar tickets iniciales
        loadTickets()

        // Verificar configuración
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        console.log('🔍 Verificando config:', {
            url: supabaseUrl?.substring(0, 30) + '...',
            keyLength: supabaseKey?.length
        })

        // Configurar suscripción Realtime
        let channel: RealtimeChannel
        let retryCount = 0
        const maxRetries = 3

        const setupRealtime = () => {
            console.log(`🔌 Configurando Realtime (intento ${retryCount + 1}/${maxRetries})...`)

            channel = supabase
                .channel('public-tickets', {
                    config: {
                        presence: {
                            key: ''
                        }
                    }
                })
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'tickets'
                    },
                    (payload) => {
                        console.log('🔔 Cambio detectado:', payload.eventType, payload)

                        if (payload.eventType === 'INSERT') {
                            console.log('➕ INSERT:', payload.new)
                            setTickets((prev) => {
                                const newTicket = payload.new as any
                                if (prev.some(t => t.id === newTicket.id)) return prev
                                return [newTicket as Ticket, ...prev]
                            })
                        } else if (payload.eventType === 'UPDATE') {
                            console.log('✏️ UPDATE:', payload.new)
                            setTickets((prev) =>
                                prev.map((ticket) =>
                                    ticket.id === (payload.new as any).id
                                        ? (payload.new as Ticket)
                                        : ticket
                                )
                            )
                        } else if (payload.eventType === 'DELETE') {
                            console.log('🗑️ DELETE:', payload.old)
                            setTickets((prev) =>
                                prev.filter((ticket) => ticket.id !== (payload.old as any).id)
                            )
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Realtime status:', status)

                    if (status === 'SUBSCRIBED') {
                        console.log('✅ REALTIME CONECTADO EXITOSAMENTE')
                        setConnectionStatus('connected')
                        retryCount = 0
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ CHANNEL_ERROR - Revisar configuración')
                        setConnectionStatus('disconnected')

                        if (retryCount < maxRetries) {
                            retryCount++
                            setTimeout(() => {
                                console.log('🔄 Reintentando conexión...')
                                supabase.removeChannel(channel)
                                setupRealtime()
                            }, 2000 * retryCount)
                        }
                    } else if (status === 'TIMED_OUT') {
                        console.error('⏱️ TIMEOUT - Conexión muy lenta')
                        setConnectionStatus('disconnected')
                    } else if (status === 'CLOSED') {
                        console.warn('⚠️ Canal cerrado')
                        setConnectionStatus('disconnected')
                    } else {
                        setConnectionStatus('connecting')
                    }
                })
        }

        setupRealtime()

        // Cleanup
        return () => {
            console.log('🔌 Limpiando Realtime...')
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [])

    return {
        tickets,
        loading,
        error,
        connectionStatus,
        refetch: loadTickets
    }
}

/**
 * Hook para obtener estadísticas de tickets
 */
export const useTicketStats = (tickets: Ticket[]) => {
    return {
        total: tickets.length,
        processed: tickets.filter(t => t.processed).length,
        unprocessed: tickets.filter(t => !t.processed).length,
        byCategory: {
            tecnico: tickets.filter(t => t.category === 'Técnico').length,
            facturacion: tickets.filter(t => t.category === 'Facturación').length,
            comercial: tickets.filter(t => t.category === 'Comercial').length,
        },
        bySentiment: {
            positivo: tickets.filter(t => t.sentiment === 'Positivo').length,
            neutral: tickets.filter(t => t.sentiment === 'Neutral').length,
            negativo: tickets.filter(t => t.sentiment === 'Negativo').length,
        }
    }
}
