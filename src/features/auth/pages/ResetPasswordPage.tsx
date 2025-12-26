import { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../store/authStore';
import StatusModal, { ModalType } from '@/components/StatusModal';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, code } = location.state || {}; // Expect email and code from previous step

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetPassword = useAuthStore(state => state.resetPassword);
    const isLoading = useAuthStore(state => state.isLoading);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: ModalType;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'error'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setModalConfig({
                isOpen: true,
                title: 'Contraseñas no coinciden',
                message: 'Por favor, asegúrate de que las contraseñas ingresadas sean idénticas.',
                type: 'error'
            });
            return;
        }
        if (!email || !code) {
            setModalConfig({
                isOpen: true,
                title: 'Error de Verificación',
                message: 'Falta información necesaria (email o código). Por favor, reinicia el proceso.',
                type: 'error'
            });
            return;
        }

        try {
            await resetPassword({ email, code, new_password: password });
            setModalConfig({
                isOpen: true,
                title: 'Contraseña Actualizada',
                message: 'Tu contraseña ha sido restablecida exitosamente.',
                type: 'success'
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || '';

            let title = 'Error';
            let message = 'No se pudo restablecer la contraseña. Inténtalo de nuevo.';

            if (errorMessage === 'Verification code has expired') {
                title = 'Código Expirado';
                message = 'El código de verificación ha expirado. Por favor, reinicia el proceso.';
            } else if (errorMessage === 'Invalid verification code') {
                title = 'Código Inválido';
                message = 'El código de verificación ya no es válido. Por favor, reinicia el proceso.';
            }

            setModalConfig({
                isOpen: true,
                title,
                message,
                type: 'error'
            });
        }
    };

    return (
        <AuthLayout title="Reestablecer contraseña">
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Nueva contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <AuthInput
                    label="Confirmar Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>

                <div className="flex justify-center mt-4">
                    <Link
                        to="/login"
                        className="text-sm text-tivit-muted hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </form>
            <StatusModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </AuthLayout>
    );
}
