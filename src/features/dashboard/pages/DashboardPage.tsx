import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '@/features/documents/components/FileUpload';
import ResultsBoard from '@/features/documents/components/ResultsBoard';
import { useDocuments } from '@/features/documents/hooks/useDocuments';

const Dashboard: React.FC = () => {
    const { status, results, thinking, handleUpload, resetUpload } = useDocuments();
    const thinkingRef = useRef<HTMLDivElement>(null);

    const handleFilesSelected = (files: File[]) => {
        handleUpload(files);
    };

    useEffect(() => {
        if (thinkingRef.current) {
            thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
        }
    }, [thinking]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative w-full">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full flex flex-col items-center z-10"
                    >
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="text-5xl md:text-8xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 mb-6 tracking-tight leading-[1.0] select-none"
                        >
                            Intelligent <br /> <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Extraction</span>
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-zinc-400 text-center max-w-lg mb-12 font-light text-lg leading-relaxed tracking-wide"
                        >
                            Enterprise-grade document analysis powered by <span className="text-tivit-red/80 font-medium">Neural Networks</span>.
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="w-full"
                        >
                            <FileUpload onFilesSelected={handleFilesSelected} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-tivit-red/5 border border-tivit-red/20 text-[10px] uppercase tracking-[0.2em] text-tivit-red mt-12 font-bold shadow-[0_0_30px_rgba(237,28,36,0.1)] backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tivit-red opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-tivit-red"></span>
                            </span>
                            System Operational
                        </motion.div>
                    </motion.div>
                )}

                {status === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl px-4"
                    >
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 border border-tivit-red/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-0 border-2 border-tivit-red/20 rounded-full border-t-transparent border-l-transparent animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute inset-4 border border-tivit-red/40 rounded-full border-r-transparent border-b-transparent animate-[spin_2s_reverse_linear_infinite]"></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-tivit-red rounded-full animate-pulse blur-[40px] opacity-40"></div>
                                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-light text-white tracking-tight">Processing Content</h3>
                            <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase">Neural Extraction Active</p>
                        </div>

                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-sm overflow-hidden flex flex-col items-start gap-2 h-[200px] transition-all duration-300">
                            <div className="flex items-center gap-2 w-full border-b border-white/5 pb-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-tivit-red animate-pulse"></div>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Live Reasoning Stream</span>
                            </div>
                            <div
                                ref={thinkingRef}
                                className="w-full h-full overflow-y-auto font-mono text-xs text-zinc-400 space-y-1 text-left leading-relaxed scrollbar-hide"
                            >
                                {thinking ? (
                                    <p className="whitespace-pre-wrap">{thinking}</p>
                                ) : (
                                    <span className="text-zinc-700 italic">Initializing thought process...</span>
                                )}
                                <div className="h-4" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {status === 'success' && (
                    <ResultsBoard key="results" results={results || []} onReset={resetUpload} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
