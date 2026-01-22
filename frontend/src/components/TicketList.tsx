import React from 'react'
import TicketCard from './TicketCard'
import type { Ticket } from '../lib/supabase'

interface TicketListProps {
    tickets: Ticket[]
    loading: boolean
    error: string | null
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
    refetch: () => Promise<void>
}

const TicketList: React.FC<TicketListProps> = ({ tickets, loading, error, connectionStatus, refetch }) => {

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-aqua-500/20 border-t-aqua-500 mx-auto mb-4"></div>
                    <p className="text-celadon-400 font-medium">Cargando tickets...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-red-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold">Error al cargar tickets</h3>
                </div>
                <p className="text-red-300 mb-4">{error}</p>
                <button
                    onClick={refetch}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors shadow-lg"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div>
            {/* Status de conexión Realtime */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-aqua-500 shadow-lg shadow-aqua-500/50' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            'bg-red-500'
                        }`}></div>
                    <span className="text-sm text-celadon-400">
                        {connectionStatus === 'connected' ? 'Conectado en tiempo real' :
                            connectionStatus === 'connecting' ? 'Conectando...' :
                                'Desconectado'}
                    </span>
                </div>
                <div className="text-sm text-celadon-500">
                    Total: <span className="font-semibold text-aqua-400">{tickets.length}</span> tickets
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-dark-700/50 backdrop-blur-sm rounded-lg shadow-2xl p-12 text-center border border-aqua-500/20">
                    <svg className="w-16 h-16 mx-auto mb-4 text-aqua-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-celadon-300 mb-2">No hay tickets</h3>
                    <p className="text-celadon-500">Los nuevos tickets aparecerán aquí automáticamente</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TicketList
