import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';

export default function VerifyCodePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'j*****@gmail.com';

    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            console.log('Verifying code', fullCode);
            navigate('/reset-password');
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
                        disabled={code.some(c => !c)}
                        className="w-full bg-tivit-red hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Verificar código
                    </button>

                    <button type="button" className="text-sm text-tivit-muted hover:text-white underline decoration-tivit-dim decoration-1 underline-offset-4">
                        Reenviar código
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
