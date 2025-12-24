import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <div className="min-h-screen w-full bg-tivit-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none select-none overflow-hidden">
                {/* Floating TIVIT text elements */}
                <div className="absolute top-[11%] left-[15%] text-[6rem] font-bold text-transparent tivit-stroke-3">TIVIT</div>
                <div className="absolute top-[2%] left-[40%] text-[6rem] font-bold text-transparent tivit-stroke-3">TIVIT</div>
                <div className="absolute top-[40%] right-[10%] text-[6rem] font-bold text-transparent transform tivit-stroke-3">TIVIT</div>
                <div className="absolute bottom-[3%] left-[10%] text-[6rem] font-bold text-transparent transform tivit-stroke-3">TIVIT</div>
                <div className="absolute -bottom-[7%] right-[25%] text-[6rem] font-bold text-transparent transform tivit-stroke-3">TIVIT</div>

                {/* Smaller scattered ones */}
                <div className="absolute top-[40%] left-[5%] text-[3rem] font-bold text-transparent tivit-stroke-2">TIVIT</div>
                <div className="absolute top-[60%] left-[15%] text-[3rem] font-bold text-transparent tivit-stroke-2">TIVIT</div>
                <div className="absolute top-[70%] right-[10%] text-[3rem] font-bold text-transparent tivit-stroke-2">TIVIT</div>
                <div className="absolute top-[20%] right-[10%] text-[3rem] font-bold text-transparent tivit-stroke-2">TIVIT</div>

                {/* Center glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tivit-red/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[900px] h-auto md:h-[600px] bg-tivit-card border border-tivit-surface rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row transition-all duration-500 animate-fade-in">

                {/* Left Side - Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="mb-8">
                        {/* Logo Placeholder */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-8 w-1 bg-tivit-red rounded-full"></div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight text-white">TIVIT</h1>
                                <span className="text-[10px] text-tivit-muted tracking-[0.2em] uppercase">Intelligent Analysis</span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                    </div>

                    {children}
                </div>

                {/* Right Side - Visual/Decor */}
                <div className="hidden md:flex w-1/2 bg-tivit-surface items-center justify-center relative overflow-hidden border-l border-tivit-surface">
                    <div className="absolute inset-0 bg-tivit-surface opacity-20 brightness-100 contrast-150"></div>

                    {/* Decorative Icons/Process visualization */}
                    <div className="relative z-10 flex flex-col items-center gap-8 opacity-80">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-tivit-muted to-tivit-muted"></div>
                        <div className="p-4 rounded-xl border border-tivit-dim bg-tivit-card/50 backdrop-blur-sm relative animate-pulse-slow">
                            <div className="absolute -top-2 -right-2 text-tivit-red">✦</div>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-tivit-text" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div className="w-px h-16 bg-gradient-to-t from-transparent via-tivit-muted to-tivit-muted"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
