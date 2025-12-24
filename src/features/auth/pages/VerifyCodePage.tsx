import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuthStore } from '../store/authStore';
import StatusModal, { ModalType } from '@/components/StatusModal';

export default function VerifyCodePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'j*****@gmail.com';
    const verifyCode = useAuthStore(state => state.verifyCode);
    const isLoading = useAuthStore(state => state.isLoading);

    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // ... (handleChange and handleKeyDown remain same, skipping them in target content for safety if they are large, but I need to replace the imports and function start)
    // Actually, I can allow the user to see the full file replace as it is safer given I have the full content.
    // However, I will target the top part and handleSubmit.

    // Changing imports and top of function:
    // ...
    // Changing handleSubmit:

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            try {
                await verifyCode(email, fullCode);
                navigate('/reset-password', { state: { email, code: fullCode } });
            } catch (error) {
                setModalConfig({
                    isOpen: true,
                    title: 'Código Incorrecto',
                    message: 'El código ingresado no es válido o ha expirado.',
                    type: 'error'
                });
            }
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };



    return (
        <AuthLayout title="Verifica tu correo electrónico">
            <p className="text-tivit-muted text-sm mb-6">
                Hemos enviado un código a <span className="font-semibold text-white">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex gap-2 justify-between">
                    {code.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-10 h-12 md:w-12 md:h-14 bg-[#1A1A1A] border border-[#333333] rounded-lg text-center text-xl font-bold text-white focus:border-tivit-red focus:ring-1 focus:ring-tivit-red/20 outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={code.some(c => !c) || isLoading}
                        className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verificando...' : 'Verificar código'}
                    </button>

                    <button type="button" className="text-sm text-tivit-muted hover:text-white underline decoration-tivit-dim decoration-1 underline-offset-4">
                        Reenviar código
                    </button>
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
