import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore'; // Example usage

const Header: React.FC = () => {
    // Placeholder for auth store usage or other logic
    return (
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar análisis, documentos..."
                        className="w-full bg-gray-800 border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-gray-900"></span>
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="h-8 w-px bg-gray-800 mx-2"></div>
                <button className="flex items-center gap-3 p-1.5 pr-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg shadow-indigo-500/20">
                        JD
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-gray-200">Juan Diaz</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
