import React from 'react';
import { X, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { GuiaAereaDataGridResponse } from '../../../services/documentService';
import { motion } from 'framer-motion';

interface ReprocessConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    document?: GuiaAereaDataGridResponse | null;
    loading?: boolean;
}

const ReprocessConfirmationModal: React.FC<ReprocessConfirmationModalProps> = ({ isOpen, onClose, onConfirm, document, loading }) => {
    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">Subsanación Requerida</h3>
                            <p className="text-xs text-gray-400">Guía Aérea: <span className="font-mono text-gray-300">{document.numero}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <FileText size={14} />
                            Observaciones Encontradas
                        </p>
                        <div className="text-sm text-red-200/90 leading-relaxed font-medium">
                            {document.observaciones || document.instruccionesEspeciales || "Sin observaciones específicas registradas, pero el documento requiere revisión."}
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        Al confirmar, el sistema intentará <strong>reprocesar y validar</strong> nuevamente la información de este documento. Asegúrese de que los datos fuente sean correctos.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex items-center gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium shadow-lg shadow-red-600/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Reprocesando...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} />
                                Confirmar y Reprocesar
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ReprocessConfirmationModal;
