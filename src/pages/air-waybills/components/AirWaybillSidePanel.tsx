import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuiaAereaFiltroRequest } from '../../../services/documentService';

interface AirWaybillSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: GuiaAereaFiltroRequest;
    onApply: (filters: Partial<GuiaAereaFiltroRequest>) => void;
}

const AirWaybillSidePanel: React.FC<AirWaybillSidePanelProps> = ({
    isOpen,
    onClose,
    currentFilters,
    onApply
}) => {
    const [localFilters, setLocalFilters] = useState<Partial<GuiaAereaFiltroRequest>>({
        nombreRemitente: '',
        nombreConsignatario: '',
        origenCodigo: '',
        destinoCodigo: '',
        habilitado: undefined
    });

    // Sync local filters with current filters when panel opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({
                nombreRemitente: currentFilters.nombreRemitente || '',
                nombreConsignatario: currentFilters.nombreConsignatario || '',
                origenCodigo: currentFilters.origenCodigo || '',
                destinoCodigo: currentFilters.destinoCodigo || '',
                habilitado: currentFilters.habilitado,
            });
        }
    }, [isOpen, currentFilters]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'habilitado') {
            setLocalFilters(prev => ({
                ...prev,
                habilitado: value === 'all' ? undefined : value === 'true'
            }));
        } else {
            setLocalFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleApply = () => {
        onApply(localFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            nombreRemitente: '',
            nombreConsignatario: '',
            origenCodigo: '',
            destinoCodigo: '',
            habilitado: undefined
        };
        setLocalFilters(clearedFilters);
        onApply(clearedFilters);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Side Filter Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 w-80 bg-[#050505] border-l border-[#2A2830] shadow-2xl z-50"
                    >
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-semibold text-white">Filtros Avanzados</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 text-left overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Origen (IATA)</label>
                                    <input
                                        type="text"
                                        name="origenCodigo"
                                        maxLength={3}
                                        value={localFilters.origenCodigo || ''}
                                        onChange={handleLocalChange}
                                        placeholder="ej. LIM"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Destino (IATA)</label>
                                    <input
                                        type="text"
                                        name="destinoCodigo"
                                        maxLength={3}
                                        value={localFilters.destinoCodigo || ''}
                                        onChange={handleLocalChange}
                                        placeholder="ej. MIA"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remitente</label>
                                    <input
                                        type="text"
                                        name="nombreRemitente"
                                        value={localFilters.nombreRemitente || ''}
                                        onChange={handleLocalChange}
                                        placeholder="Nombre del remitente"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Consignatario</label>
                                    <input
                                        type="text"
                                        name="nombreConsignatario"
                                        value={localFilters.nombreConsignatario || ''}
                                        onChange={handleLocalChange}
                                        placeholder="Nombre del consignatario"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</label>
                                    <select
                                        name="habilitado"
                                        value={localFilters.habilitado === undefined ? 'all' : localFilters.habilitado ? 'true' : 'false'}
                                        onChange={handleLocalChange}
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="true">Activos</option>
                                        <option value="false">Inactivos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 pt-6 border-t border-[#212121] flex gap-3">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#161616] text-gray-300 hover:bg-[#1E1E24] transition-all text-sm font-medium"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-tivit-red hover:bg-red-600 text-white shadow-lg shadow-tivit-red/20 transition-all text-sm font-medium"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AirWaybillSidePanel;
