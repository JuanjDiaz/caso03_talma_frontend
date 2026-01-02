import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '@/store/useAuthStore';
import StatusModal, { ModalType } from '@/components/StatusModal';
import { AuthService } from '@/features/auth/services/AuthService';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const setLoading = useAuthStore(state => state.setLoading);
    const isLoading = useAuthStore(state => state.isLoading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        if (!email.trim() || !password.trim()) {
            setModalConfig({
                isOpen: true,
                title: 'Campos Vacíos',
                message: 'Por favor, ingresa tu correo y contraseña.',
                type: 'error'
            });
            return;
        }

        try {
            setLoading(true);
            // 1. Login to get token
            const { access_token } = await AuthService.login({ email, password });

            localStorage.setItem('token', access_token);
            const user = await AuthService.getMe();

            if (user.primerIngreso) {
                setLoading(false);
                // Navigate to reset password passing email and current password as code
                navigate('/reset-password', { state: { email, code: password, isFirstLogin: true } });
                return;
            }

            login(user, access_token);
            navigate('/home');
        } catch (error: any) {
            setLoading(false);
            console.error(error);
            const errorMessage = error.response?.data?.detail || '';
            const status = error.response?.status;

            let title = 'Error de Inicio de Sesión';
            let message = 'El correo o la contraseña son incorrectos. Por favor, inténtalo de nuevo.';

            if (status === 403) {
                title = 'Cuenta Inhabilitada';
                message = errorMessage || 'El usuario se encuentra inhabilitado. Por favor, contacte al administrador.';
            } else if (errorMessage === 'Incorrect email or password') {
                title = 'Error de Autenticación';
                message = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
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
        <AuthLayout title="Inicia sesión">
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Email"
                    type="email"
                    placeholder="usuario@tivit.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="space-y-1">
                    <AuthInput
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex justify-start">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-tivit-muted hover:text-tivit-red transition-colors"
                        >
                            ¿Olvidaste la contraseña?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                    {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
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
