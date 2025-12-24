import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService, UsuarioFiltroResponse, UsuarioFiltroRequest } from '../../services/UserService';
import UserTable from './components/UserTable';
import UserFilterBar from './components/UserFilterBar';
import UserSidePanel from './components/UserSidePanel';
import UserListPagination from './components/UserListPagination';

const UserList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UsuarioFiltroResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [totalRecords, setTotalRecords] = useState(0);

    const [filters, setFilters] = useState<UsuarioFiltroRequest>({
        nombre: '',
        rolCodigo: '',
        start: 0,
        limit: 8
    });

    const fetchUsers = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await UserService.find(filters);
            setUsers(response.data || []);
            setTotalRecords(response.total || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.start, filters.limit, filters.rolCodigo, filters.nombre]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, start: 0 }));
        fetchUsers();
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

    const applySideFilters = () => {
        setFilters(prev => ({ ...prev, start: 0 }));
        fetchUsers();
        setIsFilterOpen(false);
    };

    const currentPage = Math.floor((filters.start || 0) / (filters.limit || 8)) + 1;
    const totalPages = Math.ceil(totalRecords / (filters.limit || 8));
    const startRecord = totalRecords === 0 ? 0 : (filters.start || 0) + 1;
    const endRecord = Math.min((filters.start || 0) + (filters.limit || 8), totalRecords);

    const handlePageChange = (newPage: number) => {
        const currentLimit = filters.limit || 8;
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters(prev => ({ ...prev, start: (newPage - 1) * currentLimit }));
        }
    };

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    const handleEditUser = (user: UsuarioFiltroResponse) => {
        if (user.usuarioId) {
            navigate(`/users/edit/${user.usuarioId}`);
        }
    };

    return (
        <div className="w-full font-nunito text-gray-200 relative">
            <UserSidePanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={applySideFilters}
                onClear={() => {
                    setFilters(prev => ({ ...prev, nombre: '', rolCodigo: '', start: 0 }));
                    setIsFilterOpen(false);
                }}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-white mb-1">Gestión de Usuarios</h1>
                    <p className="text-xs font-medium text-gray-300 tracking-wide">Administra los usuarios y sus permisos en el sistema</p>
                </div>
            </div>

            <UserFilterBar
                filters={filters}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onLimitChange={handleLimitChange}
                onOpenSidePanel={() => setIsFilterOpen(true)}
                onCreateUser={handleCreateUser}
            />

            <UserTable
                users={users}
                loading={loading}
                onEdit={handleEditUser}
            />

            <UserListPagination
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

export default UserList;
