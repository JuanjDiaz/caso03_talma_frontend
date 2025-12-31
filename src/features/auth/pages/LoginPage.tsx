import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '@/store/useAuthStore';
import StatusModal, { ModalType } from '@/components/StatusModal';
import { AuthService } from '@/services/AuthService';

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

            // 2. Temporarily set token for the next request (getMe)
            // Note: We might need to update axios interceptor to read this, or store.login handles it?
            // Store handles persisting, but axios needs to read it.
            // If we use store.login, it sets state. But axios reads from localStorage.
            // We should ensure axios reads correctly. 
            // For now, let's assume store syncs with localStorage quickly or we might need to manually set it for immediate use if axios reads from localStorage.

            // However, the cleanest way is:
            // AuthService.login -> returns token.
            // We manually set token in localStorage or pass it to getMe if possible? 
            // Axios interceptor reads from localStorage.getItem('token') currently (WHICH IS WRONG, see next step).
            // But let's act as if we fixed axios to read from store or we set it here.

            // Let's set it manually first to ensure getMe works if axios is using 'token' key (Current implementation of axiod.ts uses 'token').
            // AND the store uses 'auth-storage'.
            // I will align them. I will change axios to read from 'auth-storage' later (or now).
            // If I fix axios later, I can't rely on it here yet unless I fix it first.
            // I will fix axios NEXT. So here I will assume axios will work.
            // BUT to make `getMe` work *right now*, I should set the token where axios expects it OR pass header manually.

            // Let's rely on fixing axios to read from `auth-storage`.
            // BUT `auth-storage` is updated by `store.login`.
            // So we can't call `store.login` BEFORE `getMe` because `store.login` needs `user` object.
            // And `getMe` needs `token`.
            // Catch-22? No, we have the token.

            // Solution: We can set the default header for axios instance directly!
            // import api from... api.defaults.headers.common['Authorization'] = ...

            // Or just update localStorage 'token' as a fallback?
            // No, let's do it cleanly:
            // 1. Get token.
            // 2. Fetch user (manually passing header to getMe if needed? No, getMe uses api instance).

            // I will modify AuthService.getMe to accept token optionally or just use the interceptor.
            // I'll update axios.ts to read from `auth-storage` AND `localStorage.getItem('token')` as fallback.
            // So here I will set `localStorage.setItem('token', access_token)` TEMPORARILY to make `getMe` work,
            // then `store.login` will overwrite/manage `auth-storage`.

            localStorage.setItem('token', access_token);
            const user = await AuthService.getMe();

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
