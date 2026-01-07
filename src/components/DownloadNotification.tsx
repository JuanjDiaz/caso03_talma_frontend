import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, FileDown } from 'lucide-react';

export type DownloadStatus = 'downloading' | 'success' | 'error';

interface DownloadNotificationProps {
    isDownloading: boolean;
    fileName?: string;
    status?: DownloadStatus;
}

const DownloadNotification: React.FC<DownloadNotificationProps> = ({
    isDownloading,
    fileName,
    status = 'downloading'
}) => {
    return createPortal(
        <AnimatePresence>
            {isDownloading && (
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-6 right-6 z-[100] flex items-center gap-4 pl-4 pr-6 py-3.5 bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black ring-1 ring-white/5"
                >
                    {/* Icon Container */}
                    <div className="relative flex items-center justify-center w-10 h-10 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                        <AnimatePresence mode='wait'>
                            {status === 'downloading' && (
                                <motion.div
                                    key="downloading"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-blue-500/10 blur-md rounded-full" />
                                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin relative" strokeWidth={2} />
                                </motion.div>
                            )}
                            {status === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/10"
                                >
                                    <Check className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                                </motion.div>
                            )}
                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center bg-red-500/10"
                                >
                                    <FileDown className="w-5 h-5 text-red-400 rotate-45" strokeWidth={2.5} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col gap-0.5">
                        <motion.span
                            key={status}
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[13px] font-medium text-white tracking-wide leading-none"
                        >
                            {status === 'downloading' && "Descargando archivo..."}
                            {status === 'success' && "Descarga completada"}
                            {status === 'error' && "Error en la descarga"}
                        </motion.span>
                        <span className="text-[11px] text-gray-500 max-w-[200px] truncate leading-tight font-medium">
                            {fileName || "Procesando solicitud..."}
                        </span>
                    </div>

                    {/* Progress Bar (Only for downloading) */}
                    {status === 'downloading' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden bg-white/5 rounded-b-xl">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                            />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default DownloadNotification;
