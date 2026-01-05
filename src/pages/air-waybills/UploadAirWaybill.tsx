
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud,
    FileText,
    X,
    Check,
    Scan,
    Brain,
    Database,
    ShieldCheck,
    ArrowRight,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { AnalyzeService, AnalyzeEvent } from '../../services/analyzeService';

// --- VISUAL CONSTANTS (RED / CORPORATE THEME) ---
const GLOW_COLOR = {
    idle: "from-red-500/20 to-orange-500/20",
    scanning: "from-red-500 to-orange-400",
    analyzing: "from-orange-500 to-amber-400",
    saving: "from-red-600 to-red-400",
    success: "from-green-500 to-emerald-400"
};

const SHADOW_COLOR = {
    idle: "shadow-red-500/10",
    scanning: "shadow-red-500/30",
    analyzing: "shadow-orange-500/30",
    saving: "shadow-red-600/30",
    success: "shadow-green-500/40"
};

type FileStatus = 'queued' | 'scanning' | 'analyzing' | 'saving' | 'success' | 'invalid';

interface FileState {
    file: File;
    status: FileStatus;
    message?: string;
    progress: number;
}

const UploadAirWaybill: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [phase, setPhase] = useState<'idle' | 'scanning' | 'analyzing' | 'saving' | 'success'>('idle');
    const [files, setFiles] = useState<FileState[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [, setCompletedCount] = useState(0);

    // --- ACTIONS ---
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files)
            .filter(f => f.type.includes('pdf') || f.type.includes('image'))
            .map(f => ({ file: f, status: 'queued', progress: 0 } as FileState));

        setFiles(prev => [...prev, ...droppedFiles]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).map(f => ({ file: f, status: 'queued', progress: 0 } as FileState));
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const processFiles = async () => {
        if (files.length === 0) return;

        setPhase('scanning');
        setCompletedCount(0);

        // Reset statuses
        setFiles(prev => prev.map(f => ({ ...f, status: 'scanning', progress: 10, message: undefined })));

        try {
            const rawFiles = files.map(f => f.file);

            await AnalyzeService.uploadFiles(rawFiles, (event: AnalyzeEvent) => {
                const msg = event.message || "";
                const msgLower = msg.toLowerCase();

                // -------------------------------------------------------------
                // 1. GLOBAL PHASE UPDATES (Scanning -> Analyzing -> Saving)
                // -------------------------------------------------------------
                if (event.type === 'thinking') {
                    if (msgLower.includes("iniciando escaneo") || msgLower.includes("preparando")) {
                        setPhase('scanning');
                    }
                    else if (msgLower.includes("extracción neuronal") || msgLower.includes("analizando")) {
                        setPhase('analyzing');
                    }
                    else if (msgLower.includes("sincronizando") && msgLower.includes("base de datos") && !msgLower.includes("todos")) {
                        // Don't switch phase here yet, wait for save loop or handle per file
                        setPhase('saving');
                    }
                }

                // -------------------------------------------------------------
                // 2. PER-FILE UPDATES (Granular Feedback)
                // -------------------------------------------------------------

                // Helper to update specific file by name
                const updateFileStatus = (keyword: string, newStatus: FileStatus, progress: number, customMsg?: string) => {
                    setFiles(prev => prev.map(f => {
                        if (msg.includes(f.file.name)) {
                            return {
                                ...f,
                                status: newStatus,
                                progress: progress,
                                message: customMsg || msg // Use backend message directly if possible
                            };
                        }
                        return f;
                    }));
                };

                if (event.type === 'warning') {
                    // Handle Invalid Document
                    setFiles(prev => prev.map(f => {
                        if (msg.includes(f.file.name)) {
                            return { ...f, status: 'invalid', message: msg, progress: 100 };
                        }
                        return f;
                    }));
                }
                else if (event.type === 'thinking') {
                    // NEW: Detailed Backend Messages
                    if (msgLower.includes("vectorizando contenido")) {
                        updateFileStatus("vectorizando", 'scanning', 20, "Vectorizando contenido...");
                    }
                    else if (msgLower.includes("preparado para análisis")) {
                        updateFileStatus("preparado", 'scanning', 40, "Preparado para análisis neural");
                    }
                    else if (msgLower.includes("entidades extraídas")) {
                        updateFileStatus("entidades", 'analyzing', 70, "Entidades extraídas con IA");
                    }
                    else if (msgLower.includes("validando confianza")) {
                        updateFileStatus("confianza", 'analyzing', 85, "Validando confianza de datos...");
                    }
                    else if (msgLower.includes("sincronizando") && !msgLower.includes("todos")) {
                        updateFileStatus("sincronizando", 'saving', 95, "Sincronizando con Base de Datos...");
                    }
                }

                // 3. Fallback / Global Completion
                if (msgLower.includes("finalizado con éxito")) {
                    setPhase('success');
                    setFiles(prev => prev.map(f => f.status !== 'invalid' ? { ...f, status: 'success', progress: 100 } : f));
                    setCompletedCount(files.length);
                }
            });

        } catch (error: any) {
            console.error(error);
            setPhase('idle');
            // Show error/reset?
        }
    };

    // --- RENDER HELPERS ---
    const getStatusLabel = (status: FileStatus, progress: number, customMessage?: string) => {
        // PRIORITIZE BACKEND MESSAGE IF AVAILABLE
        if (customMessage && status !== 'invalid') return customMessage;

        if (status === 'queued') return 'En cola de espera...';
        if (status === 'scanning') return 'Escaneando superficie digital...';
        if (status === 'analyzing') return 'Extrayendo entidades con IA...';
        if (status === 'saving') return 'Sincronizando con Base de Datos...';
        if (status === 'success') return 'Procesamiento completado con éxito';
        if (status === 'invalid') return 'Documento rechazado por el sistema';
        return 'Estado desconocido';
    };

    const getPhaseIcon = () => {
        switch (phase) {
            case 'idle': return <UploadCloud size={48} className="text-red-500" />;
            case 'scanning': return <Scan size={48} className="text-red-400 animate-pulse" />;
            case 'analyzing': return <Brain size={48} className="text-orange-400 animate-pulse" />;
            case 'saving': return <Database size={48} className="text-red-500 animate-bounce" />;
            case 'success': return <Check size={48} className="text-white" />;
        }
    };

    const getFileStatusIcon = (status: FileStatus) => {
        switch (status) {
            case 'queued': return <FileText size={18} className="text-gray-400" />;
            case 'scanning': return <Scan size={18} className="text-red-400 animate-pulse" />;
            case 'analyzing': return <Brain size={18} className="text-orange-400 animate-pulse" />;
            case 'saving': return <Loader2 size={18} className="text-red-500 animate-spin" />;
            case 'success': return <Check size={18} className="text-green-500" />;
            case 'invalid': return <AlertTriangle size={18} className="text-red-500" />;
        }
    };

    const getFileColor = (status: FileStatus) => {
        if (status === 'invalid') return 'border-red-500/50 bg-red-900/20 text-red-100';
        if (status === 'success') return 'border-green-500/50 bg-green-900/20 text-green-100';
        if (status === 'analyzing') return 'border-orange-500/50 bg-orange-900/20 text-orange-100';
        return 'border-gray-700 bg-gray-800/50 text-gray-300';
    };

    return (
        <div className="w-full min-h-[calc(100vh-8rem)] font-nunito flex flex-col items-center justify-center p-6 relative overflow-hidden text-white"
            style={{ maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)' }}>

            {/* --- HOLOGRAPHIC BACKGROUND (RED THEME) --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            </div>

            {/* --- MAIN INTERFACE --- */}
            <motion.div
                layout
                className="relative z-10 w-full max-w-6xl flex flex-col items-center"
            >

                {/* HEADER */}
                <motion.div
                    className="mb-10 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl font-bold tracking-tighter mb-2 flex items-center justify-center gap-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            Carga Inteligente de Guías Aéreas
                        </span>
                    </h1>
                </motion.div>

                {/* --- COMMAND CENTER CARD --- */}
                <motion.div
                    layout
                    className={`
                        w-full backdrop-blur-2xl rounded-3xl border transition-all duration-700 relative overflow-hidden flex flex-col md:flex-row
                        ${phase === 'idle' ? 'bg-gray-900/40 border-white/5 max-w-2xl min-h-[400px]' : 'bg-black/60 border-gray-800 max-w-6xl min-h-[600px]'}
                        ${SHADOW_COLOR[phase]} shadow-2xl
                    `}
                >

                    {/* === LEFT PANEL: VISUALIZATION / DROPZONE === */}
                    <div className={`p-8 flex flex-col items-center justify-center relative transition-all duration-500 ${phase === 'idle' ? 'w-full' : 'w-full md:w-1/3 border-r border-gray-800'}`}>

                        <AnimatePresence mode="wait">
                            {phase === 'idle' ? (
                                <motion.div
                                    key="idle-drop"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`
                                            group cursor-pointer relative w-64 h-64 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500
                                            ${isDragging ? 'border-red-500 bg-red-500/10 scale-110' : 'border-gray-700 hover:border-red-500/50 hover:bg-gray-800/30'}
                                        `}
                                    >
                                        <div className={`absolute inset-0 rounded-full border border-red-500/30 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 animate-[spin_10s_linear_infinite] pointer-events-none`} />
                                        <div className={`absolute inset-0 rounded-full border border-orange-500/30 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 delay-100 animate-[spin_15s_linear_infinite_reverse] pointer-events-none`} />
                                        <UploadCloud size={64} className="text-gray-400 group-hover:text-red-500 transition-colors duration-300 transform group-hover:-translate-y-2 pointer-events-none" />
                                        <span className="text-gray-400 group-hover:text-white mt-4 font-medium transition-colors pointer-events-none">Arrastra archivos aquí</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="application/pdf,image/*"
                                        onChange={handleFileSelect}
                                        onClick={(e) => (e.currentTarget.value = '')}
                                    />
                                    <div className="mt-8 flex flex-col items-center w-full max-w-md">
                                        {files.length > 0 && (
                                            <>
                                                <motion.button
                                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                                    onClick={processFiles}
                                                    className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all flex items-center gap-3 mb-6"
                                                >
                                                    INICIAR ANÁLISIS ({files.length}) <ArrowRight size={20} />
                                                </motion.button>

                                                {/* Compact Idle File List */}
                                                <div className="w-full bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto backdrop-blur-sm border border-white/10">
                                                    {files.map((f, i) => (
                                                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                                                            <div className="flex items-center gap-2 text-gray-300 truncate">
                                                                <FileText size={14} />
                                                                <span className="truncate max-w-[200px]">{f.file.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="processing-vis"
                                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="relative w-full h-full flex items-center justify-center min-h-[300px]"
                                >
                                    {/* Holographic Ring */}
                                    <div className={`absolute w-64 h-64 rounded-full border-4 border-dotted opacity-30 animate-[spin_8s_linear_infinite] ${phase === 'scanning' ? 'border-red-500' : phase === 'analyzing' ? 'border-orange-500' : 'border-green-500'}`} />
                                    <div className={`absolute w-48 h-48 rounded-full border-2 opacity-50 animate-[spin_12s_linear_infinite_reverse] ${phase === 'scanning' ? 'border-red-400' : phase === 'analyzing' ? 'border-amber-400' : 'border-green-400'}`} />

                                    {/* Center Icon */}
                                    <div className="relative z-10 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
                                        {getPhaseIcon()}
                                    </div>

                                    {/* Status Text */}
                                    <div className="absolute bottom-10 text-center">
                                        <h3 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${GLOW_COLOR[phase]} uppercase`}>
                                            {phase === 'scanning' ? 'Escaneando' : phase === 'analyzing' ? 'Neural Processing' : phase === 'saving' ? 'Guardando' : 'Completado'}
                                        </h3>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* === RIGHT PANEL: FILE TIMELINE === */}
                    <div className={`p-8 flex-1 bg-black/20 overflow-y-auto max-h-[600px] transition-all duration-500 ${phase === 'idle' ? 'hidden' : 'block'}`}>
                        <h3 className="text-lg font-bold text-gray-400 mb-6 flex items-center gap-2">
                            STREAM DE DATOS ({files.length})
                            <div className="flex-1 h-px bg-gray-800" />
                        </h3>

                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {files.map((f, i) => (
                                    <motion.div
                                        key={`${f.file.name}-${i}`}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        layout
                                        className={`group relative p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${getFileColor(f.status)}`}
                                    >
                                        {/* Status Icon */}
                                        <div className={`p-2 rounded-lg bg-black/30 ${f.status === 'invalid' ? 'animate-pulse' : ''}`}>
                                            {getFileStatusIcon(f.status)}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-sm tracking-tight text-white/90">{f.file.name}</h4>
                                                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${f.status === 'success' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                    f.status === 'invalid' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                        'border-gray-600 text-gray-400'
                                                    }`}>
                                                    {f.status === 'success' ? '100%' : f.status === 'invalid' ? 'ERR' : `${f.progress}%`}
                                                </span>
                                            </div>

                                            {/* Detailed Status Subtitle */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${f.status === 'success' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                                <p className="text-xs font-mono opacity-80 truncate text-gray-300">
                                                    {f.message && f.status === 'invalid' ? f.message.replace(`El archivo ${f.file.name}`, '').replace('no es una guía aérea válida.', 'Formato no reconocido') : getStatusLabel(f.status, f.progress, f.message)}
                                                </p>
                                            </div>

                                            {/* Progress Bar or Error Msg */}
                                            {f.status === 'invalid' ? (
                                                <div className="h-1 bg-red-900/30 rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-red-500/50 w-full" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden relative">
                                                    {/* Animated striped background for active states */}
                                                    {(f.status === 'scanning' || f.status === 'analyzing' || f.status === 'saving') && (
                                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px] animate-[progress-stripes_1s_linear_infinite]" />
                                                    )}
                                                    <motion.div
                                                        className={`h-full relative ${f.status === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                                            f.status === 'analyzing' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                                                                'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                                            }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${f.progress}%` }}
                                                        transition={{ type: "spring", stiffness: 50 }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button (Idle only) */}
                                        {phase === 'idle' && (
                                            <button
                                                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {phase === 'success' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-end">
                                <button
                                    onClick={() => navigate('/air-waybills')}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:scale-105 transition-transform"
                                >
                                    VER RESULTADOS
                                </button>
                            </motion.div>
                        )}

                    </div>

                </motion.div>

                {/* Footer Security */}
                <div className="mt-8 flex items-center gap-2 text-gray-600">
                    <ShieldCheck size={16} />
                    <span className="text-xs tracking-widest uppercase">Conexión Segura TLS 1.3 • Encriptación 256-bit</span>
                </div>

            </motion.div>

        </div>
    );
};

export default UploadAirWaybill;
