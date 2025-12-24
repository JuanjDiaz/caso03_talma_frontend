import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthInput } from '../components/AuthInput';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending code
        console.log('Sending code to', email);
        navigate('/verify-code', { state: { email } });
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
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98]"
                >
                    Enviar código
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
