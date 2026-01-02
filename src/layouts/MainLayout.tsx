import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (

        <div className="min-h-screen bg-tivit-dark text-gray-100 font-sans selection:bg-tivit-red/30 flex flex-col">
            {/* Background Gradients */}


            {/* Header (Full Width) */}
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Main Layout Body */}
            <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header height */}
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <div className="flex-1 min-w-0 lg:ml-64 relative z-10 p-4 lg:p-8 ">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
