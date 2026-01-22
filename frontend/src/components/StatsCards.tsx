import React from 'react'
import { motion } from 'framer-motion'
import { useTicketStats } from '../hooks/useTickets'
import type { Ticket } from '../lib/supabase'

interface StatsCardsProps {
    tickets: Ticket[]
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

const StatsCards: React.FC<StatsCardsProps> = ({ tickets }) => {
    const stats = useTicketStats(tickets)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tickets */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8, boxShadow: "0 20px 60px rgba(130, 228, 208, 0.3)" }}
                className="bg-gradient-to-br from-bluegreen-500 to-forest-600 rounded-2xl shadow-2xl p-6 text-celadon-50 border border-aqua-500/40 shine-effect"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-aqua-200">Total Tickets</p>
                        <motion.p
                            key={stats.total}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl font-bold mt-2"
                        >
                            {stats.total}
                        </motion.p>
                    </div>
                    <div className="bg-aqua-500/20 p-3 rounded-xl backdrop-blur-sm border border-aqua-400/30">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
            </motion.div>
            {/* Técnico */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8, boxShadow: "0 20px 60px rgba(36, 134, 128, 0.3)" }}
                className="bg-gradient-to-br from-dark-600/80 to-dark-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border-l-4 border-bluegreen-500 hover:shadow-xl transition-all shine-effect"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-celadon-400">Técnico</p>
                        <motion.p
                            key={stats.byCategory.tecnico}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl font-bold text-bluegreen-400 mt-2"
                        >
                            {stats.byCategory.tecnico}
                        </motion.p>
                    </div>
                    <div className="bg-bluegreen-500/20 p-3 rounded-xl border border-bluegreen-500/30">
                        <svg className="w-8 h-8 text-bluegreen-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
            </motion.div>
            {/* Facturación */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8, boxShadow: "0 20px 60px rgba(29, 84, 80, 0.3)" }}
                className="bg-gradient-to-br from-dark-600/80 to-dark-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border-l-4 border-forest-500 hover:shadow-xl transition-all shine-effect"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-celadon-400">Facturación</p>
                        <motion.p
                            key={stats.byCategory.facturacion}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl font-bold text-forest-400 mt-2"
                        >
                            {stats.byCategory.facturacion}
                        </motion.p>
                    </div>
                    <div className="bg-forest-500/20 p-3 rounded-xl border border-forest-500/30">
                        <svg className="w-8 h-8 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </motion.div>

            {/* Comercial */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8, boxShadow: "0 20px 60px rgba(130, 228, 208, 0.3)" }}
                className="bg-gradient-to-br from-dark-600/80 to-dark-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border-l-4 border-aqua-500 hover:shadow-xl transition-all shine-effect"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-celadon-400">Comercial</p>
                        <motion.p
                            key={stats.byCategory.comercial}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl font-bold text-aqua-400 mt-2"
                        >
                            {stats.byCategory.comercial}
                        </motion.p>
                    </div>
                    <div className="bg-aqua-500/20 p-3 rounded-xl border border-aqua-500/30">
                        <svg className="w-8 h-8 text-aqua-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </motion.div>

            {/* Sentimiento Positivo */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(130, 228, 208, 0.2)" }}
                className="bg-gradient-to-br from-aqua-500/20 to-aqua-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-aqua-500/40 hover:shadow-xl transition-all"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-aqua-300 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                            </svg>
                            Positivo
                        </p>
                        <motion.p
                            key={stats.bySentiment.positivo}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-3xl font-bold text-aqua-400 mt-2"
                        >
                            {stats.bySentiment.positivo}
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Sentimiento Neutral */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(222, 230, 224, 0.1)" }}
                className="bg-gradient-to-br from-celadon-500/20 to-celadon-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-celadon-500/40 hover:shadow-xl transition-all"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-celadon-300 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7 5a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Neutral
                        </p>
                        <motion.p
                            key={stats.bySentiment.neutral}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-3xl font-bold text-celadon-200 mt-2"
                        >
                            {stats.bySentiment.neutral}
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Sentimiento Negativo */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(239, 68, 68, 0.2)" }}
                className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-500/40 hover:shadow-xl transition-all"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-300 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7 5a5 5 0 016.4 1.6 1 1 0 11-1.6 1.2 3 3 0 00-4.8-1.6 1 1 0 01-1.2-1.6 5 5 0 011.2-.6z" clipRule="evenodd" />
                            </svg>
                            Negativo
                        </p>
                        <motion.p
                            key={stats.bySentiment.negativo}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-3xl font-bold text-red-400 mt-2"
                        >
                            {stats.bySentiment.negativo}
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Procesados */}
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(36, 134, 128, 0.2)" }}
                className="bg-gradient-to-br from-bluegreen-500/20 to-forest-500/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-bluegreen-500/40 hover:shadow-xl transition-all"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-bluegreen-300">✓ Procesados</p>
                        <motion.p
                            key={`${stats.processed}-${stats.total}`}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="text-3xl font-bold text-bluegreen-400 mt-2"
                        >
                            {stats.processed} / {stats.total}
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default StatsCards
