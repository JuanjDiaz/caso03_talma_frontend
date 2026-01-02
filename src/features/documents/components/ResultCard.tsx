import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, Trash2, Shield, ShieldOff, Lock } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ComplexFieldRenderer from './ComplexFieldRenderer';

interface ResultCardProps {
    item: any;
    docIndex: number;
    onValueChange?: (docIndex: number, fieldIndex: number, newVal: any) => void;
    onDeleteField?: (docIndex: number, fieldIndex: number) => void;
    onToggleAnonymization: (docIndex: number) => void;
    onTitleChange?: (docIndex: number, newTitle: string) => void;
    isReadOnly?: boolean;
}

const ResultCard = memo(function ResultCard({
    item,
    docIndex,
    onValueChange,
    onDeleteField,
    onToggleAnonymization,
    onTitleChange,
    isReadOnly = false
}: ResultCardProps) {
    const displayName = item.fileName || `Document Analysis ${docIndex + 1}`;
    // const displayType = item.detectedType || 'DATA';
    // const displayConfidence = item.confidence != null ? item.confidence : 1.0;
    const isAnonymized = item.isAnonymized || false;

    return (
        <SpotlightCard
            className="group hover:border-tivit-red/30 transition-colors duration-500 bg-zinc-950/40"
            spotlightColor="rgba(237, 28, 36, 0.05)"
        >
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: docIndex * 0.1 + 0.2 }}
            >
                <div className="relative p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-tivit-red transition-colors duration-500 shadow-lg">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <input
                                type="text"
                                value={displayName}
                                readOnly={isReadOnly}
                                onChange={(e) => !isReadOnly && onTitleChange && onTitleChange(docIndex, e.target.value)}
                                className={`bg-transparent border-none text-white font-medium text-sm w-full focus:outline-none rounded px-1 transition-all ${isReadOnly ? 'cursor-default' : 'focus:ring-1 focus:ring-tivit-red/50 hover:bg-white/5'}`}
                                title={isReadOnly ? displayName : "Click to edit document name"}
                            />
                        </div>
                    </div>

                    {/* Anonymization Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onToggleAnonymization(docIndex)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isAnonymized
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                : 'bg-zinc-800/30 border-white/5 text-zinc-500 hover:text-zinc-300'
                                }`}
                            title={isAnonymized ? "Disable Privacy Mode" : "Enable Privacy Mode"}
                        >
                            {isAnonymized ? <Lock className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-medium tracking-wider uppercase">
                                {isAnonymized ? 'Private' : 'Public'}
                            </span>

                            {/* Switch UI */}
                            <div className={`w-6 h-3 rounded-full relative transition-colors ${isAnonymized ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                                <motion.div
                                    className="absolute top-0.5 w-2 h-2 rounded-full bg-white shadow-sm"
                                    animate={{ left: isAnonymized ? 'calc(100% - 10px)' : '2px' }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {item.fields && item.fields.length > 0 ? (
                            item.fields.map((field: any, fieldIndex: number) => (
                                <motion.div
                                    key={`${docIndex}-${fieldIndex}`}
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    className="flex flex-col gap-1 group/field relative group-hover/field:z-10"
                                >
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold group-hover/field:text-tivit-red/70 transition-colors">
                                            {field.label}
                                        </label>
                                        {!isAnonymized && onDeleteField && (
                                            <button
                                                onClick={() => onDeleteField(docIndex, fieldIndex)}
                                                className="opacity-0 group-hover/field:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all text-zinc-600 hover:text-red-500"
                                                title="Delete field"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative">
                                        {typeof field.value === 'object' && field.value !== null ? (
                                            <div className={`w-full bg-zinc-900/10 rounded-md border border-white/5 p-3 min-h-[28px] ${isAnonymized ? 'opacity-70' : ''}`}>
                                                <ComplexFieldRenderer
                                                    value={field.value}
                                                    isAnonymized={isAnonymized}
                                                    onChange={(!isAnonymized && onValueChange) ? (val) => onValueChange(docIndex, fieldIndex, val) : undefined}
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={isAnonymized ? '•'.repeat(Math.min(String(field.value).length, 24)) : field.value}
                                                readOnly={isAnonymized || !onValueChange}
                                                onChange={(e) => !isAnonymized && onValueChange && onValueChange(docIndex, fieldIndex, e.target.value)}
                                                className={`w-full bg-transparent text-sm font-light border-b py-1 focus:outline-none transition-colors resize-none field-sizing-content min-h-[28px] ${isAnonymized
                                                    ? 'text-indigo-300/50 border-indigo-500/20 cursor-not-allowed tracking-widest'
                                                    : 'text-zinc-200 border-white/5 focus:border-tivit-red/50 focus:bg-white/[0.02]'
                                                    }`}
                                                rows={1}
                                                style={{ fieldSizing: "content" } as any}
                                            />
                                        )}

                                        {isAnonymized && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 flex justify-end pointer-events-none"
                                            >
                                                <Shield className="w-4 h-4 text-indigo-500/20" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-zinc-500 text-sm italic py-4 text-center">No extracted fields available.</div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </SpotlightCard>
    );
});

export default ResultCard;
