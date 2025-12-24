import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsuarioFiltroRequest } from '../../../services/UserService';

interface UserSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: UsuarioFiltroRequest;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onApply: () => void;
    onClear: () => void;
}

const UserSidePanel: React.FC<UserSidePanelProps> = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onApply,
    onClear
}) => {
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
                                <h2 className="text-xl font-semibold text-white">Filtros</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={filters.nombre || ''}
                                        onChange={onFilterChange}
                                        placeholder="Buscar por nombre"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Operador (Rol)</label>
                                    <select
                                        name="rolCodigo"
                                        value={filters.rolCodigo || ''}
                                        onChange={onFilterChange}
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    >
                                        <option value="">Todos</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="OPERATOR">Operador</option>
                                        <option value="USER">Usuario</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-[#212121] flex gap-3">
                                <button
                                    onClick={onClear}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#161616] text-gray-300 hover:bg-[#1E1E24] transition-all text-sm font-medium"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={onApply}
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

export default UserSidePanel;
