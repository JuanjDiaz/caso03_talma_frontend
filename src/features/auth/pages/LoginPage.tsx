import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const isLoading = useAuthStore(state => state.isLoading);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        console.log(email, password);
        e.preventDefault();
        // Here we would validate with Zod
        await login(email);
        navigate('/'); // Go to dashboard after login
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
                    required
                />

                <div className="space-y-1">
                    <AuthInput
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
        </AuthLayout>
    );
}
