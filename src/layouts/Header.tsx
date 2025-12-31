import { Settings, HelpCircle, User, LogOut, Bell, Menu } from 'lucide-react';
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordModal } from '../features/auth/components/ChangePasswordModal';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-tivit-dark/70 backdrop-blur-xl supports-[backdrop-filter]:bg-tivit-dark/50">
            <div className="w-full h-16 flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative flex items-center justify-center w-8 h-8">
                            <div className="absolute inset-0 bg-tivit-red blur-lg opacity-20 rounded-full"></div>
                            <div className="relative w-1.5 h-6 bg-tivit-red rounded-full shadow-[0_0_15px_rgba(237,28,36,0.5)]"></div>
                        </div>

                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                                TIVIT
                            </h1>
                            <span className="text-[10px] uppercase tracking-widest text-tivit-muted font-medium">
                                Intelligent Analysis
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex items-center gap-1">
                    <button className="flex items-center justify-center w-9 h-9 text-tivit-muted hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5" title="Notificaciones">
                        <Bell size={18} />
                    </button>

                    <button className="flex items-center justify-center w-9 h-9 text-tivit-muted hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5" title="Configuración">
                        <Settings size={18} />
                    </button>

                    <button className="flex items-center justify-center w-9 h-9 text-tivit-muted hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5" title="Ayuda">
                        <HelpCircle size={18} />
                    </button>

                    <div className="w-px h-5 bg-white/10 mx-2"></div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`flex items-center justify-center w-9 h-9 text-tivit-muted hover:text-white transition-colors duration-300 rounded-lg ${isUserMenuOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
                            title="Perfil"
                        >
                            <User size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#0F1115] border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.name || "Usuario"}
                                    </p>
                                    <p className="text-xs text-tivit-muted truncate mt-0.5">
                                        {user?.role || "Rol"}
                                    </p>
                                </div>

                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsPasswordModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-1.5 bg-white/5 rounded-md text-tivit-muted group-hover:text-white">
                                            <Settings size={14} />
                                        </div>
                                        Cambiar Contraseña
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left mt-1"
                                    >
                                        <div className="p-1.5 bg-red-500/10 rounded-md text-red-500">
                                            <LogOut size={14} />
                                        </div>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </header>
    );
}
