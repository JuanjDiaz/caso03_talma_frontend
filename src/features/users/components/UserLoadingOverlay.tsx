import React from 'react';

interface UserLoadingOverlayProps {
    type?: 'fullscreen' | 'contained';
    message?: string;
}

const UserLoadingOverlay: React.FC<UserLoadingOverlayProps> = ({
    type = 'fullscreen',
    message = 'Procesando solicitud...'
}) => {
    const containerClasses = type === 'fullscreen'
        ? "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        : "absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] rounded-xl";

    return (
        <div className={`flex items-center justify-center ${containerClasses}`}>
            <div className="flex flex-col items-center gap-4 p-6 bg-[#1A1A1A] border border-[#333] rounded-2xl shadow-2xl transform scale-110">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-tivit-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm font-medium text-gray-200">{message}</span>
            </div>
        </div>
    );
};

export default UserLoadingOverlay;
