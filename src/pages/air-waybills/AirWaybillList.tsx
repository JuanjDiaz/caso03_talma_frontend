import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentService, GuiaAereaDataGridResponse, GuiaAereaFiltroRequest } from '../../services/documentService';
import AirWaybillTable from './components/AirWaybillTable';
import AirWaybillFilterBar from './components/AirWaybillFilterBar';
import AirWaybillSidePanel from './components/AirWaybillSidePanel';
import AirWaybillListPagination from './components/AirWaybillListPagination';
import UserLoadingOverlay from '../users/components/UserLoadingOverlay';

interface AirWaybillListProps {
    viewCode?: string;
    pageTitle?: string;
}

const AirWaybillList: React.FC<AirWaybillListProps> = ({
    viewCode = 'VC001',
    pageTitle = 'Gestión de Guías Aéreas'
}) => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<GuiaAereaDataGridResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // Initial state for filters
    const [filters, setFilters] = useState<GuiaAereaFiltroRequest>({
        start: 0,
        limit: 8,
        sort: '',
        palabraClave: '',
        vistaCodigo: viewCode
    });

    // Update filters when viewCode changes
    useEffect(() => {
        setFilters(prev => ({ ...prev, vistaCodigo: viewCode, start: 0 }));
    }, [viewCode]);

    // We use a ref to prevent race conditions or double fetching in strict mode if needed, 
    // although simply trusting useEffect dependence array is standard.
    // Race condition prevention
    const lastRequestTime = useRef(0);

    const fetchDocuments = async () => {
        setLoading(true);
        const thisRequestTime = Date.now();
        lastRequestTime.current = thisRequestTime;

        try {
            const response = await DocumentService.find(filters);
            // Only update if this is the latest request
            if (lastRequestTime.current === thisRequestTime) {
                setDocuments(response.data);
                setTotalRecords(response.total);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            if (lastRequestTime.current === thisRequestTime) {
                setDocuments([]);
                setTotalRecords(0);
            }
        } finally {
            if (lastRequestTime.current === thisRequestTime) {
                setLoading(false);
            }
        }
    };

    // Fetch on filter change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDocuments();
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.start,
        filters.limit,
        filters.palabraClave,
        filters.vistaCodigo,
        filters.origenCodigo,
        filters.destinoCodigo,
        filters.nombreRemitente,
        filters.nombreConsignatario,
        filters.habilitado
    ]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, start: 0 }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({
            ...prev,
            limit: parseInt(e.target.value, 10),
            start: 0
        }));
    };

    const applySideFilters = (newFilters: Partial<GuiaAereaFiltroRequest>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            start: 0
        }));
        setIsFilterOpen(false);
    };

    const handleCreate = () => {
        navigate('/air-waybills/upload');
    };

    const handleEdit = (doc: GuiaAereaDataGridResponse) => {
        // Navigate to detail view if exists
        console.log("Viewing doc:", doc);
    };

    // Pagination Calculations
    const currentLimit = filters.limit || 8;
    const currentPage = Math.floor((filters.start || 0) / currentLimit) + 1;
    const totalPages = Math.ceil(totalRecords / currentLimit);
    const startRecord = totalRecords === 0 ? 0 : (filters.start || 0) + 1;
    const endRecord = Math.min((filters.start || 0) + currentLimit, totalRecords);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters(prev => ({ ...prev, start: (newPage - 1) * currentLimit }));
        }
    };

    return (
        <div className="w-full font-nunito text-gray-200 relative min-h-screen">
            {/* Reusing UserLoadingOverlay for generic loading if needed, though Table handles specific validation loading */}
            {/* {loading && <UserLoadingOverlay type="fullscreen" />} */}

            <AirWaybillSidePanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={applySideFilters}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-white mb-1">{pageTitle}</h1>
                    <p className="text-xs font-medium text-gray-300 tracking-wide">Consulta y gestión de documentos registrados</p>
                </div>
            </div>

            <AirWaybillFilterBar
                filters={filters}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onLimitChange={handleLimitChange}
                onOpenSidePanel={() => setIsFilterOpen(true)}
                onCreate={handleCreate}
                totalRecords={totalRecords}
            />

            <AirWaybillTable
                documents={documents}
                loading={loading}
                onEdit={handleEdit}
                viewCode={viewCode}
            />

            <AirWaybillListPagination
                startRecord={startRecord}
                endRecord={endRecord}
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default AirWaybillList;
