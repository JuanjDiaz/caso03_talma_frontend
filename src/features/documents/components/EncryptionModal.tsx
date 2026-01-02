import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, X, ShieldAlert } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface EncryptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    mode?: 'encrypt' | 'decrypt';
    title?: string;
}

export default function EncryptionModal({ isOpen, onClose, onConfirm, mode = 'encrypt', title }: EncryptionModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onConfirm(password);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Operation failed. Check password.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md"
                >
                    <SpotlightCard
                        className="bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
                        spotlightColor="rgba(255, 255, 255, 0.05)"
                    >
                        <div className="p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/5 ${mode === 'encrypt' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    {mode === 'encrypt' ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white">{title || (mode === 'encrypt' ? 'Enable Privacy' : 'Disable Privacy')}</h3>
                                    <p className="text-zinc-400 text-sm">
                                        {mode === 'encrypt'
                                            ? 'Enter a password to encrypt and hide the data.'
                                            : 'Enter your password to decrypt and view the data.'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        placeholder={mode === 'encrypt' ? "Create a secure password" : "Enter decryption password"}
                                        autoFocus
                                    />
                                    {error && (
                                        <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                            <ShieldAlert className="w-3 h-3" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg flex items-center justify-center gap-2 ${mode === 'encrypt'
                                            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                                            : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                {mode === 'encrypt' ? 'Encrypt & Hide' : 'Decrypt & Show'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
