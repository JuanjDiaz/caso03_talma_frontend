import React from 'react';
import { Search, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { GuiaAereaFiltroRequest } from '@/features/$(Split-Path (Split-Path AirWaybillRectifyFilterBar.tsx.Directory.Parent.FullName -Leaf) -Leaf)/services/documentService';

interface AirWaybillRectifyFilterBarProps {
    filters: GuiaAereaFiltroRequest;
    onSearch: (e: React.FormEvent<HTMLFormElement>) => void;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onLimitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onOpenSidePanel: () => void;
    totalRecords?: number;
    onRefresh: () => void;
}

const AirWaybillRectifyFilterBar: React.FC<AirWaybillRectifyFilterBarProps> = ({
    filters,
    onSearch,
    onFilterChange,
    onLimitChange,
    onOpenSidePanel,
    onRefresh
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 rounded-xl">
            <div className="w-full flex items-center gap-4 flex-1 md:w-auto">
                <div className="relative w-20">
                    <select
                        name="limit"
                        value={filters.limit}
                        onChange={onLimitChange}
                        className="appearance-none bg-[#161616] text-gray-200 border border-[#212121] rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-tivit-red cursor-pointer w-full"
                    >
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                <form onSubmit={onSearch} className="flex-1 max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        name="palabraClave"
                        value={filters.palabraClave || ''}
                        onChange={onFilterChange}
                        placeholder="Buscar por número, origen, destino..."
                        className="w-full bg-[#161616] border border-[#212121] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red transition-all"
                    />
                    <button type="submit" className="hidden" />
                </form>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    type="button"
                    onClick={onOpenSidePanel}
                    className="px-4 py-2 bg-[#1E1E24] hover:bg-[#25252D] text-gray-200 rounded-lg border border-[#2A2830] transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                >
                    <Filter className="w-4 h-4" />
                    Filtrar
                </button>

                <button
                    type="button"
                    onClick={onRefresh}
                    className="p-2 bg-[#1E1E24] hover:bg-[#25252D] text-gray-200 rounded-lg border border-[#2A2830] transition-all"
                    title="Refrescar"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AirWaybillRectifyFilterBar;
