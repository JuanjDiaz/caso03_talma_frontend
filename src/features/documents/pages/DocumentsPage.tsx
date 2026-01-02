import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import ResultsBoard from '../components/ResultsBoard';
import { useDocuments } from '../hooks/useDocuments';
import { AlertCircle } from 'lucide-react';

export default function DocumentsPage() {
    const { status, results, error, thinking, handleUpload, resetUpload } = useDocuments();
    const thinkingRef = useRef<HTMLDivElement>(null);

    const onFilesSelected = (selectedFiles: File[]) => {
        handleUpload(selectedFiles);
    };

    // Auto-scroll the thinking logs
    useEffect(() => {
        if (thinkingRef.current) {
            thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
        }
    }, [thinking]);

    return (
        <div className="relative font-sans h-full">
            <div className="relative z-10 max-w-5xl mx-auto pt-4">
                <header className="mb-8 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Secure Upload</span>
                    </div>
                </header>

                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6 text-white"
                    >
                        Análisis de Documentos
                    </motion.h1>
                    <AnimatePresence>
                        {status === 'idle' && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-zinc-400 text-lg max-w-xl mx-auto font-light"
                            >
                                Sube tus archivos PDF, Imágenes o Excel. Nuestro sistema los validará y procesará de forma segura.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="min-h-[400px] flex flex-col items-center">

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full"
                            >
                                <FileUpload onFilesSelected={onFilesSelected} maxSizeInMB={10} />
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

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-lg w-full text-center"
                            >
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                                <p className="text-red-200 mb-6">{error || "Something went wrong."}</p>
                                <button onClick={resetUpload} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors font-medium">
                                    Try Again
                                </button>
                            </motion.div>
                        )}

                        {status === 'success' && results && (
                            <ResultsBoard results={results} onReset={resetUpload} />
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
