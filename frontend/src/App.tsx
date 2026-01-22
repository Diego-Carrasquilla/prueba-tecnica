import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import TicketList from './components/TicketList'
import StatsCards from './components/StatsCards'
import CreateTicketModal from './components/CreateTicketModal'
import ParallaxBackground from './components/ParallaxBackground'
import { useTickets } from './hooks/useTickets'

function App() {
    const { tickets, loading, error, connectionStatus, refetch } = useTickets()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <ParallaxBackground />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'linear-gradient(135deg, #1d5450 0%, #248680 100%)',
                        color: '#dee6e0',
                        boxShadow: '0 10px 40px rgba(130, 228, 208, 0.2)',
                        border: '1px solid rgba(130, 228, 208, 0.2)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#82e4d0',
                            secondary: '#1d5450',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#1d5450',
                        },
                    },
                }}
            />

            <div className="min-h-screen relative">
                {/* Header */}
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="bg-dark-500/80 backdrop-blur-xl shadow-2xl border-b border-aqua-500/20 sticky top-0 z-30"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex items-center gap-3"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                                    className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-aqua-500 to-bluegreen-500 rounded-xl shadow-lg shadow-aqua-500/30"
                                >
                                    <svg className="w-7 h-7 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-aqua-500 via-bluegreen-400 to-forest-400 bg-clip-text text-transparent animate-gradient">
                                        Centro de Control de Tickets
                                    </h1>
                                    <p className="mt-1 text-sm text-celadon-400 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-aqua-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Análisis inteligente en tiempo real
                                    </p>
                                </div>
                            </motion.div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(130, 228, 208, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-bluegreen-500 to-forest-500 text-celadon-50 rounded-xl font-semibold shadow-lg shadow-bluegreen-900/50 hover:shadow-xl hover:shadow-aqua-500/30 transition-all shine-effect"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Crear Ticket
                                    </span>
                                </motion.button>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
                                    className={`px-4 py-2 rounded-xl border backdrop-blur-sm ${connectionStatus === 'connected'
                                        ? 'bg-aqua-500/10 border-aqua-500/40 shadow-lg shadow-aqua-500/20'
                                        : connectionStatus === 'connecting'
                                            ? 'bg-yellow-500/10 border-yellow-500/40'
                                            : 'bg-red-500/10 border-red-500/40'
                                        }`}>
                                    <p className={`text-xs font-medium ${connectionStatus === 'connected' ? 'text-aqua-400'
                                        : connectionStatus === 'connecting' ? 'text-yellow-400'
                                            : 'text-red-400'
                                        }`}>Realtime</p>
                                    <p className={`text-lg font-bold ${connectionStatus === 'connected' ? 'text-aqua-300'
                                        : connectionStatus === 'connecting' ? 'text-yellow-300'
                                            : 'text-red-300'
                                        }`}>
                                        {connectionStatus === 'connected' ? 'Activo'
                                            : connectionStatus === 'connecting' ? 'Conectando...'
                                                : 'Desconectado'}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                        className="mb-8"
                    >
                        <StatsCards tickets={tickets} />
                    </motion.div>

                    {/* Tickets List */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                        className="bg-dark-600/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-aqua-500/20"
                    >
                        <h2 className="text-xl sm:text-2xl font-semibold text-aqua-400 mb-6 flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-aqua-500/20 rounded-lg flex items-center justify-center border border-aqua-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span>Actividad Reciente</span>
                        </h2>
                        <TicketList
                            tickets={tickets}
                            loading={loading}
                            error={error}
                            connectionStatus={connectionStatus}
                            refetch={refetch}
                        />
                    </motion.div>
                </main>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="bg-dark-500/80 backdrop-blur-xl border-t border-aqua-500/20 mt-12"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-center text-sm text-celadon-400">
                            Sistema de Tickets con React 18 + TypeScript + Vite + Tailwind CSS + Supabase Realtime + IA
                        </p>
                    </div>
                </motion.footer>
            </div>

            <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}

export default App
