import { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Reset logic
        console.log('Resetting password');
        navigate('/login');
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
                    className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98]"
                >
                    Actualizar contraseña
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
        </AuthLayout>
    );
}
