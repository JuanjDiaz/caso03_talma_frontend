import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, FileText, FileSpreadsheet, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxSizeInMB?: number;
    acceptedFormats?: string[]; // e.g., ['.pdf', '.jpg', '.xlsx']
}

export default function FileUpload({
    onFilesSelected,
    maxSizeInMB = 10,
    acceptedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls']
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check if camera is available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setHasCamera(true);
        }
    }, []);

    const validateFiles = (files: File[]): File[] => {
        const validFiles: File[] = [];
        const newErrors: string[] = [];
        const MAX_SIZE = maxSizeInMB * 1024 * 1024;

        files.forEach(file => {
            // Validate Size
            if (file.size > MAX_SIZE) {
                newErrors.push(`File "${file.name}" exceeds the ${maxSizeInMB}MB limit.`);
                return;
            }

            // Validate Extension (Basic check matching accept attribute)
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            const isValidFormat = acceptedFormats.some(format => format.toLowerCase() === fileExtension);

            // Also check MIME types for robustness if needed, but extension is often enough for UI feedback
            // For Excel: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel

            if (!isValidFormat) {
                newErrors.push(`File "${file.name}" has an invalid format.`);
                return;
            }

            validFiles.push(file);
        });

        if (newErrors.length > 0) {
            setErrors(prev => [...prev, ...newErrors]);
            // Auto-clear errors after 5 seconds
            setTimeout(() => setErrors([]), 5000);
        }

        return validFiles;
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const ValidFiles = validateFiles(Array.from(e.dataTransfer.files));
            if (ValidFiles.length > 0) {
                onFilesSelected(ValidFiles);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const ValidFiles = validateFiles(Array.from(e.target.files));
            if (ValidFiles.length > 0) {
                onFilesSelected(ValidFiles);
            }
        }
        // Reset input value to allow selecting the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // Placeholder for CameraCapture if we decide to port it, otherwise functionality disabled or simplified
    // For now, I'll keep the button logic but comment out the component import to avoid breaking build if missing.
    // Assuming we might not need camera for Excel tasks, but keeping for images.
    const handleCameraCapture = (file: File) => {
        onFilesSelected([file]);
        setShowCamera(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 relative">
            <AnimatePresence>
                {errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-4 w-full flex flex-col items-center z-50 mb-4 pointer-events-none"
                    >
                        {errors.map((err, idx) => (
                            <div key={idx} className="bg-red-500/90 text-white text-sm px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center gap-2 backdrop-blur-sm">
                                <X size={14} />
                                {err}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={`relative group cursor-pointer overflow-hidden rounded-3xl border transition-all duration-500 ease-out
          ${isDragging
                        ? 'border-red-500/50 bg-red-500/5 scale-[1.01] shadow-[0_0_40px_rgba(237,28,36,0.15)]'
                        : 'border-white/5 bg-zinc-900/40 hover:border-red-500/30 hover:bg-zinc-900/60 hover:shadow-lg'
                    }
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>

                <div className="flex flex-col items-center justify-center py-16 px-8 text-center relative z-10">
                    <div
                        className={`mb-6 p-6 rounded-2xl bg-[#0d0d10] border border-white/5 shadow-inner transition-transform duration-500 ${isDragging ? 'scale-110 shadow-red-500/20' : 'group-hover:scale-105'}`}
                    >
                        <svg
                            className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-red-500' : 'text-zinc-500 group-hover:text-red-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-light text-white mb-2">
                        Upload Documents
                    </h3>
                    <p className="text-zinc-500 text-sm mb-8 font-light tracking-wide cursor-default">
                        <span className="text-red-500 underline underline-offset-4 decoration-red-500/30 group-hover:decoration-red-500 transition-all cursor-pointer">Browse</span>
                        {' '}files or drag and drop
                    </p>

                    {/* File Types Indicators */}
                    <div className="flex gap-3 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium opacity-60 mt-8 cursor-default flex-wrap justify-center">
                        <span className="border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
                        <span className="border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1"><ImageIcon className="w-3 h-3" /> JPG/PNG</span>
                        <span className="border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> EXCEL</span>
                    </div>
                </div>

                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleChange}
                    multiple
                    accept={acceptedFormats.join(',')}
                />
            </div>

            {/* Camera placeholder - kept dormant for now as we didn't port CameraCapture component yet */}
            {hasCamera && showCamera && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white">
                    Camera Feature Placeholder
                    <button onClick={() => setShowCamera(false)} className="ml-4 underline">Close</button>
                </div>
            )}
        </div>
    );
}
