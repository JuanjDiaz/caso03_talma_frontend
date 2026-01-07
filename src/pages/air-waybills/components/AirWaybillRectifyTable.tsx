import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Edit2, Plane, CheckCircle, XCircle, AlertTriangle, ShieldCheck,
    MoreVertical, Eye, Activity, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentService, GuiaAereaDataGridResponse } from '../../../services/documentService';
import DownloadNotification, { DownloadStatus } from '../../../components/DownloadNotification';

interface AirWaybillRectifyTableProps {
    documents: GuiaAereaDataGridResponse[];
    loading: boolean;
    onEdit: (doc: GuiaAereaDataGridResponse) => void;
}

const AirWaybillRectifyTable: React.FC<AirWaybillRectifyTableProps> = ({ documents, loading, onEdit }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('downloading');

    const navigate = useNavigate();

    // Close menu on scroll or resize
    useEffect(() => {
        const handleScroll = () => setOpenMenuId(null);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();
        if (openMenuId === id) {
            setOpenMenuId(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenMenuId(id);
            setMenuPosition({
                top: rect.bottom + 5,
                left: rect.right - 180
            });
        }
    };

    const handleAction = async (action: string, doc: GuiaAereaDataGridResponse) => {
        setOpenMenuId(null);

        if (action === 'view') {
            navigate(`/air-waybills/view/${doc.guiaAereaId}`, { state: { doc } });
            return;
        }

        if (action === 'download') {
            if (!doc.url) {
                console.error("URL no disponible para descargar");
                return;
            }

            const filename = doc.url.split('/').pop() || `${doc.numero || 'documento'}.pdf`;
            setDownloadingDoc(filename);
            setDownloadStatus('downloading');

            try {
                // Descargar el blob usando el servicio
                const blob = await DocumentService.descargarGuiaAerea(doc.url);

                // Crear URL temporal
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;

                link.setAttribute('download', filename);

                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);

                setDownloadStatus('success');
            } catch (error) {
                console.error("Error descargando archivo:", error);
                setDownloadStatus('error');
            } finally {
                setTimeout(() => {
                    setDownloadingDoc(null);
                    setDownloadStatus('downloading');
                }, 2000);
            }
            return;
        }

        if (action === 'reprocess') {
            onEdit(doc);
        }

        if (action === 'traceability') {
            console.log("Traceability for", doc.numero);
        }
    };

    const getCycleBadge = (code?: string) => {
        const styles: Record<string, string> = {
            "ESTGA001": "bg-blue-500/10 text-blue-400 border-blue-500/20",
            "ESTGA002": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            "ESTGA003": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
            "ESTGA004": "bg-purple-500/10 text-purple-400 border-purple-500/20",
            "ESTGA005": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            "ESTGA006": "bg-red-500/10 text-red-400 border-red-500/20",
        };

        const labels: Record<string, string> = {
            "ESTGA001": "Procesando",
            "ESTGA002": "Observado",
            "ESTGA003": "Procesado",
            "ESTGA004": "Enviado",
            "ESTGA005": "Aceptado",
            "ESTGA006": "Rechazado",
        };

        const style = styles[code || ""] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
        const label = labels[code || ""] || code || "Desconocido";

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
                {label}
            </span>
        );
    };

    const getConfidenceBadge = (pctString?: string) => {
        if (!pctString) return <span className="text-gray-500">-</span>;
        const val = parseFloat(pctString.replace('%', ''));
        let colorClass = "text-gray-400";
        let Icon = ShieldCheck;

        if (val >= 95) {
            colorClass = "text-emerald-400";
        } else if (val >= 60) {
            colorClass = "text-yellow-400";
            Icon = AlertTriangle;
        } else {
            colorClass = "text-red-400";
            Icon = AlertTriangle;
        }

        return (
            <div className={`flex items-center justify-center gap-1.5 ${colorClass}`}>
                <Icon size={14} />
                <span className="font-medium">{pctString}</span>
            </div>
        );
    };

    return (
        <>
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
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nro. Guía</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Origen / Destino</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Remitente</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Consignatario</th>

                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Confianza</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Ciclo de Vida</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Creado</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs mt-2 block">Cargando guías...</span>
                                    </td>
                                </tr>
                            ) : !documents || documents.length === 0 ? (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td colSpan={8} className="text-center py-12 text-gray-500">No se encontraron registros</td>
                                </motion.tr>
                            ) : (
                                documents.map((doc, index) => (
                                    <motion.tr
                                        key={doc.guiaAereaId || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-[#070707] transition-colors group"
                                    >
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-white">{doc.numero}</span>
                                            </div>
                                        </td>

                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <span className="font-mono bg-[#1E1E24] px-2 py-0.5 rounded text-xs border border-[#2A2830]">{doc.origenCodigo}</span>
                                                <Plane size={12} className="text-gray-500" />
                                                <span className="font-mono bg-[#1E1E24] px-2 py-0.5 rounded text-xs border border-[#2A2830]">{doc.destinoCodigo}</span>
                                            </div>
                                            {doc.transbordo && (
                                                <div className="text-[10px] text-gray-500 mt-1 pl-1">
                                                    Vía: {doc.transbordo}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3 py-2 max-w-[180px] truncate text-xs text-gray-400" title={doc.nombreRemitente}>
                                            {doc.nombreRemitente}
                                        </td>

                                        <td className="px-3 py-2 max-w-[180px] truncate text-xs text-gray-400" title={doc.nombreConsignatario}>
                                            {doc.nombreConsignatario}
                                        </td>

                                        <td className="px-3 py-2 text-center whitespace-nowrap text-xs">
                                            {getConfidenceBadge(doc.confidenceTotalPct)}
                                        </td>

                                        <td className="px-3 py-2 text-center whitespace-nowrap">
                                            {getCycleBadge(doc.estadoRegistroCodigo)}
                                        </td>

                                        <td className="px-3 py-2 text-center whitespace-nowrap text-xs text-gray-400">
                                            {doc.fechaConsulta ? (
                                                (() => {
                                                    try {
                                                        const date = new Date(doc.fechaConsulta);
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const year = date.getFullYear();
                                                        const hours = String(date.getHours()).padStart(2, '0');
                                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                                        return (
                                                            <div className="flex flex-col items-center">
                                                                <span>{`${day}-${month}-${year}`}</span>
                                                                <span className="text-[10px] text-gray-500">{`${hours}:${minutes}`}</span>
                                                            </div>
                                                        );
                                                    } catch { return doc.fechaConsulta; }
                                                })()
                                            ) : '-'}
                                        </td>

                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2 items-center">


                                                <button
                                                    className={`p-2 rounded-lg transition-all cursor-default ${doc.habilitado
                                                        ? 'text-green-500 hover:bg-green-500/10 hover:text-green-400'
                                                        : 'text-gray-500 hover:bg-gray-500/10 hover:text-gray-400'
                                                        }`}
                                                    title={doc.habilitado ? "Activo" : "Inactivo"}
                                                >
                                                    <CheckCircle size={16} className={doc.habilitado ? "" : "hidden"} />
                                                    <XCircle size={16} className={!doc.habilitado ? "" : "hidden"} />
                                                </button>

                                                <button
                                                    onClick={(e) => toggleMenu(e, doc.guiaAereaId || String(index))}
                                                    className={`p-2 rounded-lg transition-all ${openMenuId === (doc.guiaAereaId || String(index))
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Render Dropdown using Portal to escape parent stacking contexts/transforms */}
            {openMenuId && menuPosition && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setOpenMenuId(null)}
                    />
                    <div
                        className="fixed bg-[#161616] border border-[#2A2830] rounded-lg shadow-xl z-[70] overflow-hidden"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                            minWidth: '160px'
                        }}
                    >
                        <div className="py-1">
                            {(() => {
                                const doc = documents.find((d, i) => (d.guiaAereaId || String(i)) === openMenuId);
                                if (!doc) return null;

                                return (
                                    <>
                                        <button
                                            onClick={() => handleAction('view', doc)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1E24] hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            <Eye size={14} className="text-gray-500" />
                                            Visualizar
                                        </button>

                                        <button
                                            onClick={() => handleAction('download', doc)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1E24] hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            <Download size={14} className="text-gray-500" />
                                            Descargar
                                        </button>

                                        <button
                                            onClick={() => handleAction('reprocess', doc)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1E24] hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            <Edit2 size={14} className="text-gray-500" />
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => handleAction('traceability', doc)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1E24] hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            <Activity size={14} className="text-gray-500" />
                                            Trazabilidad
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </>,
                document.body
            )}

            <DownloadNotification
                isDownloading={!!downloadingDoc}
                fileName={downloadingDoc || undefined}
                status={downloadStatus}
            />
        </>
    );
};

export default AirWaybillRectifyTable;
