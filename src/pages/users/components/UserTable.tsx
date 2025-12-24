import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UsuarioFiltroResponse } from '../../../services/UserService';

interface UserTableProps {
    users: UsuarioFiltroResponse[];
    loading: boolean;
    onEdit?: (user: UsuarioFiltroResponse) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#08080A]/50 border border-[#1B1818] rounded-xl overflow-hidden backdrop-blur-sm mb-4"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-[#0A0A0A]">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Documento</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Creado</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs mt-2 block">Cargando usuarios...</span>
                                </td>
                            </tr>
                        ) : !users || users.length === 0 ? (
                            <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td colSpan={6} className="text-center py-12 text-gray-500">No se encontraron usuarios registrados</td>
                            </motion.tr>
                        ) : (
                            users.map((user, index) => {
                                // Format date as mm-dd-yyyy
                                const formatDate = (dateString?: string) => {
                                    if (!dateString) return '-';
                                    try {
                                        const date = new Date(dateString);
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const year = date.getFullYear();
                                        return `${month}-${day}-${year}`;
                                    } catch (e) {
                                        return dateString;
                                    }
                                };

                                return (
                                    <motion.tr
                                        key={user.usuarioId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-[#070707] transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">

                                                <div>
                                                    <div className="font-medium text-white text-sm">{user.nombreCompleto || 'Sin Nombre'}</div>
                                                    <div className="text-xs text-gray-500">{user.correo || 'Sin Correo'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {user.rol || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300">{user.documento || '-'}</div>
                                            <div className="text-xs text-gray-500">{user.tipoDocumento || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400">{user.celular || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-400">{formatDate(user.creado)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                    title="Editar"
                                                    onClick={() => onEdit && onEdit(user)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default UserTable;
