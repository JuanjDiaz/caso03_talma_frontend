import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, RotateCcw, Check, Loader2, ShieldOff, Lock, Download } from 'lucide-react';
import { useExtractEditor } from '../hooks/useExtractEditor';
import ResultCard from './ResultCard';
import EncryptionModal from './EncryptionModal';

interface ExportButtonProps {
    label: string;
    onClick: () => void;
}

const ExportButton = ({ label, onClick }: ExportButtonProps) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900 border border-white/5 rounded-md hover:text-white hover:border-white/20 transition-colors"
    >
        <Download className="w-3 h-3" />
        {label}
    </button>
);

interface ResultsBoardProps {
    results: any[];
    onReset: () => void;
}

export default function ResultsBoard({ results, onReset }: ResultsBoardProps) {
    const {
        editableResults,
        saveStatus,
        handleValueChange,
        handleDeleteField,
        handleEncryptDocument,
        handleDecryptDocument,
        handleGlobalEncryption,
        handleTitleChange,
        handleSave
    } = useExtractEditor(results);

    const [modal, setModal] = useState<{
        isOpen: boolean;
        mode: 'encrypt' | 'decrypt';
        type: 'single' | 'global';
        docIndex: number | null;
    }>({
        isOpen: false,
        mode: 'encrypt', // 'encrypt' | 'decrypt'
        type: 'single',  // 'single' | 'global'
        docIndex: null
    });

    if (!editableResults) return null;

    const isAllAnonymized = editableResults.length > 0 && editableResults.every(item => item.isEncrypted);

    // Handler for single document toggle
    const handleToggleClick = (docIndex: number) => {
        const doc = editableResults[docIndex];
        const isEncrypted = doc.isEncrypted;

        setModal({
            isOpen: true,
            mode: isEncrypted ? 'decrypt' : 'encrypt',
            type: 'single',
            docIndex
        });
    };

    // Handler for global toggle
    const handleGlobalToggle = () => {
        setModal({
            isOpen: true,
            mode: isAllAnonymized ? 'decrypt' : 'encrypt',
            type: 'global',
            docIndex: null
        });
    };

    const handleModalConfirm = async (password: string) => {
        if (modal.type === 'single') {
            if (modal.docIndex !== null) {
                if (modal.mode === 'encrypt') {
                    await handleEncryptDocument(modal.docIndex, password);
                } else {
                    await handleDecryptDocument(modal.docIndex, password);
                }
            }
        } else {
            // Global
            await handleGlobalEncryption(password, modal.mode === 'encrypt');
        }
    };

    const handleExport = (type: 'json' | 'txt' | 'docx') => {
        if (!editableResults || editableResults.length === 0) return;

        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        let content = '';
        let mimeType = '';
        let extension = '';

        if (type === 'json') {
            content = JSON.stringify(editableResults, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else if (type === 'txt') {
            mimeType = 'text/plain';
            extension = 'txt';
            editableResults.forEach((doc, idx) => {
                content += `DOCUMENT ${idx + 1}: ${doc.fileName}\n`;
                // content += `Type: ${doc.detectedType}\n`;
                content += '='.repeat(40) + '\n';
                doc.fields.forEach((field: any) => {
                    let valStr = typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value;
                    content += `${field.label}:\n${valStr}\n\n`;
                });
                content += '\n\n';
            });
        } else if (type === 'docx') {
            mimeType = 'application/msword';
            extension = 'doc'; // Use .doc for simpler HTML export

            // Generate HTML compatible with Word
            let htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Export</title>
                <style>body{font-family:Arial,sans-serif;} table{border-collapse:collapse;width:100%;margin-bottom:20px;} th,td{border:1px solid #000;padding:8px;text-align:left;} th{background-color:#eee;}</style>
                </head><body>
            `;

            editableResults.forEach((doc, idx) => {
                htmlContent += `<h1>Document ${idx + 1}: ${doc.fileName}</h1>`;
                // htmlContent += `<p><strong>Type:</strong> ${doc.detectedType}</p><hr/>`;

                doc.fields.forEach((field: any) => {
                    htmlContent += `<h3>${field.label}</h3>`;

                    if (Array.isArray(field.value) && field.value.length > 0 && typeof field.value[0] === 'object') {
                        // Render Table
                        htmlContent += `<table><thead><tr>`;
                        const keys = Object.keys(field.value[0]);
                        keys.forEach(k => htmlContent += `<th>${k}</th>`);
                        htmlContent += `</tr></thead><tbody>`;

                        field.value.forEach((row: any) => {
                            htmlContent += `<tr>`;
                            keys.forEach(k => {
                                let val = row[k];
                                if (typeof val === 'object') val = JSON.stringify(val);
                                htmlContent += `<td>${val || ''}</td>`;
                            });
                            htmlContent += `</tr>`;
                        });
                        htmlContent += `</tbody></table>`;
                    } else if (typeof field.value === 'object') {
                        htmlContent += `<pre>${JSON.stringify(field.value, null, 2)}</pre>`;
                    } else {
                        htmlContent += `<p>${field.value}</p>`;
                    }
                });
                htmlContent += `<br style='page-break-before:always'/>`;
            });
            htmlContent += `</body></html>`;
            content = htmlContent;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis_export_${timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl mx-auto pb-20"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-white/5 pb-6 gap-6 md:gap-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-tivit-red" />
                            <h2 className="text-3xl font-light text-white tracking-tight">Analysis Report</h2>
                        </div>
                        <p className="text-zinc-500 text-sm">Review, edit, and save extracted data.</p>
                    </div>

                    <div className="flex gap-3 flex-wrap md:flex-nowrap">
                        {/* Global Privacy Toggle */}
                        <button
                            onClick={handleGlobalToggle}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/5 ${isAllAnonymized
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                                }`}
                            title={isAllAnonymized ? "Make All Public" : "Make All Private"}
                        >
                            {isAllAnonymized ? <Lock className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                            <span className="hidden md:inline">Global Privacy</span>

                            {/* Switch UI */}
                            <div className={`w-8 h-4 rounded-full relative transition-colors ml-1 ${isAllAnonymized ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                                <motion.div
                                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
                                    animate={{ left: isAllAnonymized ? 'calc(100% - 14px)' : '2px' }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </button>

                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Analyze New
                        </button>

                        <motion.button
                            layout
                            onClick={() => handleSave(onReset)}
                            disabled={saveStatus !== 'idle'}
                            className={`relative flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg overflow-hidden ${saveStatus === 'success'
                                ? 'bg-emerald-500 text-white shadow-emerald-900/20'
                                : 'bg-tivit-red hover:bg-tivit-red/90 text-white shadow-tivit-red/20'
                                }`}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {saveStatus === 'idle' && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Guardar</span>
                                    </motion.div>
                                )}

                                {saveStatus === 'saving' && (
                                    <motion.div
                                        key="saving"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </motion.div>
                                )}

                                {saveStatus === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>Guardado</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>

                <div className="flex justify-end mb-6 gap-2">
                    <ExportButton label="JSON" onClick={() => handleExport('json')} />
                    <ExportButton label="TXT" onClick={() => handleExport('txt')} />
                    <ExportButton label="DOCX" onClick={() => handleExport('docx')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {editableResults.length > 0 ? (
                        editableResults.map((item, docIndex) => (
                            <ResultCard
                                key={docIndex}
                                item={item}
                                docIndex={docIndex}
                                onValueChange={handleValueChange}
                                onDeleteField={handleDeleteField}
                                onToggleAnonymization={handleToggleClick}
                                onTitleChange={handleTitleChange}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/20">
                            <p className="text-zinc-500 italic">No extraction data found in the analyzed documents.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            <EncryptionModal
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleModalConfirm}
                mode={modal.mode}
                title={modal.type === 'global' ? `Global Privacy ${modal.mode === 'encrypt' ? 'ON' : 'OFF'}` : undefined}
            />
        </>
    );
}
