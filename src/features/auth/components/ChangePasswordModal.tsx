import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserService } from '@/features/$(Split-Path (Split-Path ChangePasswordModal.tsx.Directory.Parent.FullName -Leaf) -Leaf)/services/UserService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const cleanPassword = password.trim();
        const cleanConfirm = confirmPassword.trim();

        if (!cleanPassword || !cleanConfirm) {
            setError("La contraseña no puede estar vacía ni contener solo espacios");
            return;
        }

        if (cleanPassword !== cleanConfirm) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (cleanPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        const hasUpperCase = /[A-Z]/.test(cleanPassword);
        const hasLowerCase = /[a-z]/.test(cleanPassword);
        const hasNumber = /[0-9]/.test(cleanPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError("La contraseña debe incluir mayúsculas, minúsculas y números");
            return;
        }

        try {
            setLoading(true);
            await UserService.updatePassword(cleanPassword, cleanConfirm);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setPassword('');
                setConfirmPassword('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    // Use Portal to render outside the current DOM hierarchy (avoids clipping by Header)
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative top blur */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-tivit-red/50 blur-[20px] rounded-full"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">

                        <h2 className="text-lg font-semibold text-white">Cambiar Contraseña</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200 text-sm">
                            <CheckCircle size={16} />
                            <span>¡Contraseña actualizada correctamente!</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-medium ml-1">Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-tivit-red/50 focus:ring-1 focus:ring-tivit-red/50 transition-all font-mono text-sm pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-medium ml-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-tivit-red/50 focus:ring-1 focus:ring-tivit-red/50 transition-all font-mono text-sm pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                                    ${loading || success
                                        ? 'bg-white/5 text-gray-400 cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-tivit-red to-[#D4141E] text-white hover:shadow-[0_0_20px_rgba(237,28,36,0.3)] hover:scale-[1.02] border border-transparent'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Actualizando...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Actualizado</span>
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};
