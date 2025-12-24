import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Cargando información...' }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Loading Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative z-10 flex flex-col items-center justify-center p-8 bg-[#0A0A0A]/90 border border-[#1B1818] rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto"
                    >
                        <div className="relative mb-4">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-tivit-red/20 blur-xl rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                                <Loader2 className="w-10 h-10 text-tivit-red relative z-10" />
                            </motion.div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-200 text-sm font-medium tracking-wide"
                        >
                            {message}
                        </motion.p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
