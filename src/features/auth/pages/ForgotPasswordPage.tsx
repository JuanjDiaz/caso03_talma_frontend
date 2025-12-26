import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../store/authStore';
import StatusModal, { ModalType } from '@/components/StatusModal';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const forgotPassword = useAuthStore(state => state.forgotPassword);
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

        if (!email.trim()) {
            setModalConfig({
                isOpen: true,
                title: 'Campo Vacío',
                message: 'Por favor, ingresa tu correo.',
                type: 'error'
            });
            return;
        }

        try {
            await forgotPassword(email);
            navigate('/verify-code', { state: { email } });
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || '';

            let title = 'Error';
            let message = 'No se pudo enviar el código. Por favor, inténtalo de nuevo.';

            if (errorMessage === 'Email not registered') {
                title = 'Correo no registrado';
                message = 'Este correo electrónico no se encuentra registrado en el sistema.';
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
        <AuthLayout title="¿Olvidaste tu contraseña?">
            <p className="text-tivit-muted text-sm mb-6">
                Ingresa tu email y te enviaremos el código de verificación
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Email"
                    type="email"
                    placeholder="usuario@tivit.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Enviando...' : 'Enviar código'}
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
