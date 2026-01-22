import React, { useState, useMemo } from 'react'
import TicketCard from './TicketCard'
import type { Ticket, TicketCategory, TicketSentiment } from '../lib/supabase'

interface TicketListProps {
    tickets: Ticket[]
    loading: boolean
    error: string | null
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
    refetch: () => Promise<void>
}

type ProcessedFilter = 'all' | 'processed' | 'unprocessed'

const TicketList: React.FC<TicketListProps> = ({ tickets, loading, error, connectionStatus, refetch }) => {
    const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all')
    const [sentimentFilter, setSentimentFilter] = useState<TicketSentiment | 'all'>('all')
    const [processedFilter, setProcessedFilter] = useState<ProcessedFilter>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            // Filtro por categoría
            if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false
            // Filtro por sentimiento
            if (sentimentFilter !== 'all' && ticket.sentiment !== sentimentFilter) return false
            // Filtro por estado de procesamiento
            if (processedFilter === 'processed' && !ticket.processed) return false
            if (processedFilter === 'unprocessed' && ticket.processed) return false
            // Filtro por búsqueda
            if (searchQuery && !ticket.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
    }, [tickets, categoryFilter, sentimentFilter, processedFilter, searchQuery])

    const clearFilters = () => {
        setCategoryFilter('all')
        setSentimentFilter('all')
        setProcessedFilter('all')
        setSearchQuery('')
    }

    const hasActiveFilters = categoryFilter !== 'all' || sentimentFilter !== 'all' || processedFilter !== 'all' || searchQuery !== ''

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
                    Mostrando: <span className="font-semibold text-aqua-400">{filteredTickets.length}</span> de <span className="font-semibold text-aqua-400">{tickets.length}</span> tickets
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 bg-dark-700/50 backdrop-blur-sm rounded-xl p-4 border border-aqua-500/20">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Búsqueda */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-celadon-400 mb-1.5">Buscar</label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-celadon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar en descripción..."
                                className="w-full pl-10 pr-4 py-2 bg-dark-600/50 border border-aqua-500/30 rounded-lg text-sm text-celadon-200 placeholder-celadon-600 focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Filtro Categoría */}
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-celadon-400 mb-1.5">Categoría</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | 'all')}
                            className="w-full px-3 py-2 bg-dark-600/50 border border-aqua-500/30 rounded-lg text-sm text-celadon-200 focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todas</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Facturación">Facturación</option>
                            <option value="Comercial">Comercial</option>
                        </select>
                    </div>

                    {/* Filtro Sentimiento */}
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-celadon-400 mb-1.5">Sentimiento</label>
                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value as TicketSentiment | 'all')}
                            className="w-full px-3 py-2 bg-dark-600/50 border border-aqua-500/30 rounded-lg text-sm text-celadon-200 focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todos</option>
                            <option value="Positivo">Positivo</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Negativo">Negativo</option>
                        </select>
                    </div>

                    {/* Filtro Estado */}
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-celadon-400 mb-1.5">Estado</label>
                        <select
                            value={processedFilter}
                            onChange={(e) => setProcessedFilter(e.target.value as ProcessedFilter)}
                            className="w-full px-3 py-2 bg-dark-600/50 border border-aqua-500/30 rounded-lg text-sm text-celadon-200 focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todos</option>
                            <option value="processed">Procesados</option>
                            <option value="unprocessed">Sin procesar</option>
                        </select>
                    </div>

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="bg-dark-700/50 backdrop-blur-sm rounded-lg shadow-2xl p-12 text-center border border-aqua-500/20">
                    <svg className="w-16 h-16 mx-auto mb-4 text-aqua-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-celadon-300 mb-2">
                        {hasActiveFilters ? 'No hay resultados' : 'No hay tickets'}
                    </h3>
                    <p className="text-celadon-500">
                        {hasActiveFilters
                            ? 'Prueba ajustando los filtros de búsqueda'
                            : 'Los nuevos tickets aparecerán aquí automáticamente'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 bg-aqua-500/20 text-aqua-300 border border-aqua-500/40 rounded-lg text-sm font-medium hover:bg-aqua-500/30 transition-all"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TicketList
