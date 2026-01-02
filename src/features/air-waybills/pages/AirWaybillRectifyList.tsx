import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { DocumentService, GuiaAereaDataGridResponse, GuiaAereaFiltroRequest } from '@/features/documents/services/documentService';
import AirWaybillRectifyTable from '../components/AirWaybillRectifyTable';
import AirWaybillRectifyFilterBar from '../components/AirWaybillRectifyFilterBar';
import AirWaybillSidePanel from '../components/AirWaybillSidePanel';
import AirWaybillListPagination from '../components/AirWaybillListPagination';
import SuccessModal from '@/components/SuccessModal';
import ReprocessConfirmationModal from '../components/ReprocessConfirmationModal';

const AirWaybillRectifyList: React.FC = () => {
    // Hardcoded for Rectify View
    const pageTitle = "Subsanación de Guías";
    const viewCode = "VC002";

    const navigate = useNavigate();
    const [documents, setDocuments] = useState<GuiaAereaDataGridResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal States
    const [reprocessModalOpen, setReprocessModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<GuiaAereaDataGridResponse | null>(null);
    const [reprocessLoading, setReprocessLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Initial state for filters
    const [filters, setFilters] = useState<GuiaAereaFiltroRequest>({
        start: 0,
        limit: 8,
        sort: '',
        palabraClave: '',
        vistaCodigo: viewCode
    });

    const lastRequestTime = useRef(0);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchDocuments = async () => {
        setLoading(true);
        const thisRequestTime = Date.now();
        lastRequestTime.current = thisRequestTime;

        try {
            const response = await DocumentService.find(filters);
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
    }, [
        filters.start,
        filters.limit,
        filters.palabraClave,
        // filters.vistaCodigo is constant here
        filters.origenCodigo,
        filters.destinoCodigo,
        filters.nombreRemitente,
        filters.nombreConsignatario,
        filters.habilitado,
        refreshTrigger
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

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (doc: GuiaAereaDataGridResponse) => {
        navigate('/air-waybills/rectify/edit', { state: { doc } });
    };

    const handleConfirmReprocess = async () => {
        if (!selectedDoc?.guiaAereaId) return;
        setReprocessLoading(true);
        try {
            const res = await DocumentService.reprocess(selectedDoc.guiaAereaId);
            setReprocessModalOpen(false);
            setSuccessMessage(res.mensaje || "El documento ha sido enviado a reprocesamiento exitosamente.");
            setSuccessModalOpen(true);
            fetchDocuments();
        } catch (e) {
            console.error("Error reprocessing:", e);
        } finally {
            setReprocessLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessModalOpen(false);
        setSuccessMessage("");
        setSelectedDoc(null);
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
            <AirWaybillSidePanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={filters}
                onApply={applySideFilters}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-white mb-1">{pageTitle}</h1>
                    <p className="text-xs font-medium text-gray-300 tracking-wide">Gestión y corrección de documentos observados</p>
                </div>
            </div>

            <AirWaybillRectifyFilterBar
                filters={filters}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onLimitChange={handleLimitChange}
                onOpenSidePanel={() => setIsFilterOpen(true)}
                onRefresh={handleRefresh}
                totalRecords={totalRecords}
            />

            <AirWaybillRectifyTable
                documents={documents}
                loading={loading}
                onEdit={handleEdit}
            />

            <AirWaybillListPagination
                startRecord={startRecord}
                endRecord={endRecord}
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <ReprocessConfirmationModal
                isOpen={reprocessModalOpen}
                onClose={() => setReprocessModalOpen(false)}
                onConfirm={handleConfirmReprocess}
                document={selectedDoc}
                loading={reprocessLoading}
            />

            <SuccessModal
                isOpen={successModalOpen}
                onClose={handleCloseSuccess}
                title="Reprocesamiento Iniciado"
                message={successMessage}
            />
        </div>
    );
};

export default AirWaybillRectifyList;
