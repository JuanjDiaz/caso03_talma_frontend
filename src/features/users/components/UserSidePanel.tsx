import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsuarioFiltroRequest, UserService, UsuarioComboResponse } from '@/features/users/services/UserService';

interface UserSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: UsuarioFiltroRequest;
    onApply: (filters: Partial<UsuarioFiltroRequest>) => void;
}

const UserSidePanel: React.FC<UserSidePanelProps> = ({
    isOpen,
    onClose,
    currentFilters,
    onApply
}) => {
    const [combos, setCombos] = useState<UsuarioComboResponse | null>(null);
    const [localFilters, setLocalFilters] = useState<Partial<UsuarioFiltroRequest>>({
        nombre: '',
        rolCodigo: '',
    });

    useEffect(() => {
        const loadCombos = async () => {
            try {
                const data = await UserService.initForm();
                setCombos(data);
            } catch (error) {
                console.error("Error loading filter combos:", error);
            }
        };
        loadCombos();
    }, []);

    // Sync local filters with current filters when panel opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({
                nombre: currentFilters.nombre || '',
                rolCodigo: currentFilters.rolCodigo || '',
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
            nombre: '',
            rolCodigo: '',
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
                                <h2 className="text-xl font-semibold text-white">Filtros</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 text-left">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={localFilters.nombre || ''}
                                        onChange={handleLocalChange}
                                        placeholder="Buscar por nombre"
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</label>
                                    <select
                                        name="rolCodigo"
                                        value={localFilters.rolCodigo || ''}
                                        onChange={handleLocalChange}
                                        className="w-full bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-tivit-red transition-all"
                                    >
                                        <option value="">Todos</option>
                                        {combos?.rol?.list.map(role => (
                                            <option key={role.id} value={role.codigo} className="bg-[#1E1E1E]">
                                                {role.nombre}
                                            </option>
                                        ))}
                                    </select>
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

                            <div className="mt-auto pt-6 border-t border-[#212121] flex gap-3">
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

export default UserSidePanel;
