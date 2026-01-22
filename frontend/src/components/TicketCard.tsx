import React from 'react'
import { motion } from 'framer-motion'
import { Ticket, TicketCategory, TicketSentiment } from '../lib/supabase'

interface TicketCardProps {
    ticket: Ticket
}

// Helper para obtener color según la categoría
const getCategoryColor = (category: TicketCategory): string => {
    switch (category) {
        case 'Técnico':
            return 'bg-bluegreen-500/20 text-aqua-400 border-bluegreen-500/40 shadow-bluegreen-500/20'
        case 'Facturación':
            return 'bg-forest-500/20 text-aqua-300 border-forest-500/40 shadow-forest-500/20'
        case 'Comercial':
            return 'bg-aqua-500/20 text-aqua-200 border-aqua-500/40 shadow-aqua-500/20'
        default:
            return 'bg-celadon-500/20 text-celadon-300 border-celadon-500/40'
    }
}

// Helper para obtener color según el sentimiento
const getSentimentColor = (sentiment: TicketSentiment): string => {
    switch (sentiment) {
        case 'Positivo':
            return 'bg-aqua-500/20 text-aqua-300 border-aqua-500/40 shadow-aqua-500/30'
        case 'Neutral':
            return 'bg-celadon-500/20 text-celadon-300 border-celadon-500/40'
        case 'Negativo':
            return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/20'
        default:
            return 'bg-celadon-500/20 text-celadon-300 border-celadon-500/40'
    }
}

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(130, 228, 208, 0.2), 0 0 0 1px rgba(130, 228, 208, 0.3)"
            }}
            transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            className="bg-gradient-to-br from-dark-600/60 to-dark-700/60 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-aqua-500/20 group cursor-pointer relative overflow-hidden shine-effect"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-aqua-500/5 to-bluegreen-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <motion.span
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-lg ${getCategoryColor(ticket.category)}`}
                            >
                                {ticket.category}
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-lg ${getSentimentColor(ticket.sentiment)}`}
                            >
                                {ticket.sentiment}
                            </motion.span>
                        </div>
                        <p className="text-sm text-celadon-400">
                            {formatDate(ticket.created_at)}
                        </p>
                    </div>
                    <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className={`px-3 py-1 text-xs rounded-md font-medium border shadow-lg ${ticket.processed
                                ? 'bg-aqua-500/20 text-aqua-300 border-aqua-500/40 shadow-aqua-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/30'
                            }`}
                    >
                        {ticket.processed ? '✓ Procesado' : '⏳ Sin procesar'}
                    </motion.span>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-celadon-300 leading-relaxed group-hover:text-celadon-200 transition-colors"
                >
                    {ticket.description}
                </motion.p>

                <div className="mt-3 pt-3 border-t border-aqua-500/10">
                    <p className="text-xs text-celadon-500 font-mono flex items-center gap-2">
                        <svg className="w-3 h-3 text-aqua-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        ID: {ticket.id.slice(0, 8)}...
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

export default TicketCard
