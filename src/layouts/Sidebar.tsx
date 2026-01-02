import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    FileText,
    BarChart3,
    Home,
    ShieldCheck,
    Map,
    ChevronRight,
    ChevronDown,
    LogOut,
    AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface NavItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path?: string;
    children?: NavItem[];
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => {
            const isCurrentlyOpen = !!prev[label];
            // If currently open, toggle it off (resulting in empty object or just this one false)
            // If currently closed, return new object with ONLY this one true (accordion behavior)
            return isCurrentlyOpen ? { ...prev, [label]: false } : { [label]: true };
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        { icon: Home, label: 'Inicio', path: '/home' },
        {
            icon: FileText,
            label: 'Guías aéreas',
            children: [
                { icon: BarChart3, label: 'Registros', path: '/air-waybills' },
                { icon: AlertTriangle, label: 'Subsanar', path: '/air-waybills/rectify' },
            ],
        },
        { icon: Map, label: 'Trazabilidad', path: '/trazabilidad' },
        { icon: BarChart3, label: 'Reportes', path: '/reports' },
        {
            icon: ShieldCheck,
            label: 'Seguridad',
            children: [
                { icon: Home, label: 'Usuarios', path: '/users' },
                { icon: Home, label: 'Permisos', path: '/permissions' },
            ],
        },
    ];

    return (
        <>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed left-0 top-16 bottom-0 w-64 bg-tivit-dark/95 
                backdrop-blur-xl supports-[backdrop-filter]:bg-tivit-dark/80 
                border-r border-white/5 text-gray-400 flex flex-col z-40 
                font-nunito font-medium transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus[item.label];

                        const isChildActive =
                            hasChildren &&
                            item.children!.some((child) => child.path === location.pathname);

                        return (
                            <div key={item.label} className="mb-1">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-white/5 hover:text-white ${isChildActive ? 'text-white' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                className={`w-5 h-5 transition-colors ${isExpanded || isChildActive
                                                    ? 'text-white'
                                                    : 'group-hover:text-white'
                                                    }`}
                                            />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.path!}
                                        onClick={() => window.innerWidth < 1024 && onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                                ? 'bg-tivit-red/10 text-tivit-red border border-tivit-red/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 transition-colors" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </NavLink>
                                )}

                                {hasChildren && isExpanded && (
                                    <div className="mt-1 ml-4 space-y-1 border-l border-gray-800 pl-2">
                                        {item.children!.map((subItem) => (
                                            <NavLink
                                                end
                                                key={subItem.path}
                                                to={subItem.path!}
                                                onClick={() => window.innerWidth < 1024 && onClose()}
                                                className={({ isActive }) =>
                                                    `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                        ? 'text-tivit-red font-medium bg-tivit-red/5'
                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                    }`
                                                }
                                            >
                                                {subItem.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 w-full transition-all duration-200 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                        <span className="font-medium text-sm">Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
