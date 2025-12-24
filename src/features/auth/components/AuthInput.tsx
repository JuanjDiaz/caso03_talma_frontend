import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
    return (
        <div className="w-full space-y-2">
            <label className="text-sm font-medium text-tivit-text/90 block">
                {label}
            </label>
            <div className="relative group">
                <input
                    className={`
                        w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-4 py-3 text-tivit-text
                        placeholder:text-tivit-muted/50 outline-none transition-all duration-300
                        focus:border-tivit-red focus:ring-1 focus:ring-tivit-red/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${Icon ? 'pr-10' : ''}
                        ${error ? 'border-red-500 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {Icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tivit-muted group-focus-within:text-tivit-red transition-colors duration-300">
                        <Icon size={20} />
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1 animate-fade-in">{error}</p>
            )}
        </div>
    );
};
