import { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import StatusModal, { ModalType } from '@/components/StatusModal';
import { useEffect } from 'react';
import { AuthService } from '@/features/auth/services/AuthService';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, code, isFirstLogin } = location.state || {}; // Expect email and code from previous step

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // const resetPassword = useAuthStore(state => state.resetPassword); // Removed as it doesn't exist in store
    // const isLoading = useAuthStore(state => state.isLoading);
    // const setLoading = useAuthStore(state => state.setLoading);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (isFirstLogin) {
            setModalConfig({
                isOpen: true,
                title: 'Cambio de Contraseña',
                message: 'Por seguridad, es obligatorio cambiar tu contraseña en tu primer ingreso.',
                type: 'info'
            });
        }
    }, [isFirstLogin]);

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

        // Only check for email and code if it's NOT a first login (authenticated change)
        if (!isFirstLogin && (!email || !code)) {
            setModalConfig({
                isOpen: true,
                title: 'Error de Verificación',
                message: 'Falta información necesaria (email o código). Por favor, reinicia el proceso.',
                type: 'error'
            });
            return;
        }

        const payload = { email, code, new_password: password };

        try {
            setIsLoading(true);
            if (isFirstLogin) {
                await AuthService.changePassword(password);
            } else {
                await AuthService.resetPassword(payload);
            }
            setIsLoading(false);

            setModalConfig({
                isOpen: true,
                title: 'Contraseña Actualizada',
                message: 'Tu contraseña ha sido restablecida exitosamente.',
                type: 'success'
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            setIsLoading(false);
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
        <AuthLayout title={isFirstLogin ? "Cambiar contraseña" : "Reestablecer contraseña"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Nueva contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                />

                <AuthInput
                    label="Confirmar Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
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
