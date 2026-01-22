import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createTicket } from '../services/api'
import toast from 'react-hot-toast'

interface CreateTicketModalProps {
    isOpen: boolean
    onClose: () => void
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!description.trim()) {
            toast.error('Por favor, describe tu problema')
            return
        }

        setIsLoading(true)
        try {
            await createTicket(description)
            toast.success('✓ Ticket enviado')
            setDescription('')
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al crear el ticket')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-dark-600/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-aqua-500/30"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-bluegreen-500 to-forest-600 px-6 py-5 border-b border-aqua-500/20">
                                <div className="flex items-center justify-between">
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-aqua-500/20 rounded-lg flex items-center justify-center border border-aqua-400/30">
                                            <svg className="w-6 h-6 text-aqua-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-celadon-50">Nuevo Ticket</h2>
                                            <p className="text-aqua-200 text-sm mt-0.5 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                Clasificación automática con IA
                                            </p>
                                        </div>
                                    </motion.div>
                                    <motion.button
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(130, 228, 208, 0.2)" }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="text-celadon-100 hover:bg-aqua-500/20 rounded-full p-2 transition-colors outline-none focus:outline-none border-none"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-6"
                                >
                                    <label className="block text-sm font-semibold text-aqua-400 mb-2">
                                        Describe tu problema o consulta
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ejemplo: Mi conexión a internet está muy lenta desde hace dos días..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-dark-700/50 border-2 border-aqua-500/30 rounded-xl focus:border-aqua-500 focus:ring-4 focus:ring-aqua-500/20 transition-all resize-none text-celadon-200 placeholder-celadon-600 backdrop-blur-sm"
                                        disabled={isLoading}
                                    />
                                    <p className="text-sm text-celadon-500 mt-2">
                                        Mínimo 10 caracteres. La IA determinará la categoría y el sentimiento.
                                    </p>
                                </motion.div>

                                {/* Info Cards */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid grid-cols-3 gap-3 mb-6"
                                >
                                    <div className="bg-bluegreen-500/20 rounded-lg p-3 border border-bluegreen-500/40 backdrop-blur-sm">
                                        <div className="text-bluegreen-300 font-semibold text-xs">Categoría</div>
                                        <div className="text-aqua-200 text-sm mt-1">Auto-detectada</div>
                                    </div>
                                    <div className="bg-aqua-500/20 rounded-lg p-3 border border-aqua-500/40 backdrop-blur-sm">
                                        <div className="text-aqua-300 font-semibold text-xs">Sentimiento</div>
                                        <div className="text-celadon-200 text-sm mt-1">Analizado por IA</div>
                                    </div>
                                    <div className="bg-forest-500/20 rounded-lg p-3 border border-forest-500/40 backdrop-blur-sm">
                                        <div className="text-forest-300 font-semibold text-xs">Tiempo Real</div>
                                        <div className="text-aqua-200 text-sm mt-1">Instantáneo</div>
                                    </div>
                                </motion.div>

                                {/* Buttons */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex gap-3"
                                >
                                    <motion.button
                                        type="button"
                                        onClick={onClose}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 border-2 border-aqua-500/30 text-celadon-300 rounded-xl hover:bg-aqua-500/10 transition-all font-semibold backdrop-blur-sm"
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || description.length < 10}
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(130, 228, 208, 0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-bluegreen-500 to-forest-500 text-celadon-50 rounded-xl hover:from-bluegreen-600 hover:to-forest-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-bluegreen-900/50 hover:shadow-xl shine-effect"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Analizando...
                                            </span>
                                        ) : (
                                            'Crear Ticket'
                                        )}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default CreateTicketModal
