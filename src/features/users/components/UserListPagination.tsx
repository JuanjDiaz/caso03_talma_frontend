import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserListPaginationProps {
    startRecord: number;
    endRecord: number;
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const UserListPagination: React.FC<UserListPaginationProps> = ({
    startRecord,
    endRecord,
    totalRecords,
    currentPage,
    totalPages,
    onPageChange
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
            <div className="text-xs text-gray-500 font-medium">
                Mostrando {startRecord} a {endRecord} de {totalRecords} datos
            </div>

            <div className="flex items-center gap-6">
                <span className="text-xs text-gray-500 font-medium">{currentPage} de {totalPages} páginas</span>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Pagination Logic: Show limited pages */}
                    {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;

                        if (totalPages <= maxVisiblePages) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                            if (currentPage <= 3) {
                                for (let i = 1; i <= 4; i++) pages.push(i);
                                pages.push('...');
                                pages.push(totalPages);
                            } else if (currentPage >= totalPages - 2) {
                                pages.push(1);
                                pages.push('...');
                                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                pages.push('...');
                                pages.push(currentPage - 1);
                                pages.push(currentPage);
                                pages.push(currentPage + 1);
                                pages.push('...');
                                pages.push(totalPages);
                            }
                        }

                        return pages.map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="w-8 h-8 flex items-center justify-center text-gray-500 text-xs">...</span>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(Number(page))}
                                        className={`
                                            w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                                            ${currentPage === page
                                                ? 'bg-[#1E1E24] text-tivit-red border border-[#2A2830]'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ));
                    })()}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserListPagination;
