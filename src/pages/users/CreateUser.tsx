import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService, UsuarioRequest, UsuarioComboResponse } from '../../services/UserService';
import StatusModal, { ModalType } from '../../components/StatusModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import { motion } from 'framer-motion';

const CreateUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<UsuarioRequest>({
        usuarioId: '',
        primerNombre: '',
        segundoNombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        correo: '',
        celular: '',
        tipoDocumentoCodigo: '',
        documento: '',
        rolId: ''
    });

    const [combos, setCombos] = useState<UsuarioComboResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: ModalType;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        const fetchInitData = async () => {
            setLoading(true);
            try {
                const comboData = await UserService.initForm();
                setCombos(comboData);

                if (isEditMode) {
                    const userData = await UserService.getById(id);

                    setFormData({
                        usuarioId: userData.usuarioId,
                        primerNombre: (userData as any).primerNombre || '',
                        segundoNombre: (userData as any).segundoNombre || '',
                        apellidoPaterno: (userData as any).apellidoPaterno || '',
                        apellidoMaterno: (userData as any).apellidoMaterno || '',
                        correo: userData.correo || '',
                        celular: userData.celular || '',
                        tipoDocumentoCodigo: (userData as any).tipoDocumentoCodigo || '',
                        documento: userData.documento || '',
                        rolId: (userData as any).rolId || ''
                    });
                }

            } catch (err) {
                console.error("Error cargando datos:", err);
                setModalConfig({
                    isOpen: true,
                    title: 'Error de Carga',
                    message: 'No se pudieron cargar los datos.',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInitData();
    }, [isEditMode, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create a payload and remove usuarioId if it's an empty string or null
            const payload = { ...formData };
            if (!payload.usuarioId || payload.usuarioId.trim() === '') {
                delete payload.usuarioId;
            }

            await UserService.saveOrUpdate(payload);
            setModalConfig({
                isOpen: true,
                title: isEditMode ? '¡Actualización Exitosa!' : '¡Registro Exitoso!',
                message: isEditMode
                    ? 'Los datos del usuario han sido actualizados correctamente.'
                    : 'El usuario ha sido registrado correctamente en el sistema.',
                type: 'success'
            });

            if (!isEditMode) {
                setFormData({
                    primerNombre: '',
                    segundoNombre: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    correo: '',
                    celular: '',
                    tipoDocumentoCodigo: '',
                    documento: '',
                    rolId: ''
                });
            } else {
                setTimeout(() => navigate('/users'), 1500);
            }
        } catch (err) {
            console.error("Error guardando usuario:", err);
            setModalConfig({
                isOpen: true,
                title: 'Error de Operación',
                message: 'Ocurrió un problema al intentar guardar los datos.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <LoadingOverlay isLoading={loading} message={isEditMode ? "Cargando datos del usuario..." : "Iniciando formulario..."} />
            <StatusModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-4xl mx-auto mt-2 font-nunito font-medium px-4 md:px-0"
            >
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-medium text-white mb-2">
                        {isEditMode ? 'Editar Usuario' : 'Registro de Usuario'}
                    </h1>
                    <label className="text-xs font-medium text-gray-300 tracking-wide block">
                        {isEditMode
                            ? 'Modifique los datos del usuario seleccionado'
                            : 'Complete los datos para registrar un nuevo usuario en el sistema'}
                    </label>
                </div>

                <div className="bg-transparent">
                    <form className="space-y-4 md:space-y-2" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-2">

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Primer Nombre<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="primerNombre"
                                    value={formData.primerNombre || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="Ej. Juan"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Segundo Nombre
                                </label>
                                <input
                                    type="text"
                                    name="segundoNombre"
                                    value={formData.segundoNombre || ''}
                                    onChange={handleChange}
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="Ej. Carlos"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Apellido Paterno<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="apellidoPaterno"
                                    value={formData.apellidoPaterno || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="Ej. Perez"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Apellido Materno<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="apellidoMaterno"
                                    value={formData.apellidoMaterno || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="Ej. Gomez"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Correo Electrónico<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="juan.perez@empresa.com"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    Celular<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="celular"
                                    value={formData.celular || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="999 888 777"
                                />
                            </div>
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    TIPO DE DOCUMENTO<span className="text-tivit-red">*</span>
                                </label>
                                <select
                                    name="tipoDocumentoCodigo"
                                    value={formData.tipoDocumentoCodigo || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all appearance-none"
                                >
                                    <option value="" className="bg-[#1E1E1E]">Seleccionar...</option>
                                    {loading && <option value="" disabled className="bg-[#1E1E1E]">Cargando...</option>}
                                    {combos?.tipoDocumento?.list.map(item => (
                                        <option key={item.id} value={item.codigo} className="bg-[#1E1E1E]">{item.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    DOCUMENTO<span className="text-tivit-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="documento"
                                    value={formData.documento || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A] border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all"
                                    placeholder="12345678"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col">

                                <label className="text-xs font-light text-gray-300 uppercase tracking-wide">
                                    ROL<span className="text-tivit-red">*</span>
                                </label>
                                <select
                                    name="rolId"
                                    value={formData.rolId || ''}
                                    onChange={handleChange}
                                    required
                                    className="text-xs w-full md:w-[70%] h-10 md:h-[60%] bg-[#08080A]  border border-[#1B1818] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-tivit-red focus:ring-1 focus:ring-tivit-red transition-all appearance-none"
                                >
                                    <option value="" className="bg-[#1E1E1E]">Seleccionar...</option>
                                    {loading && <option value="" disabled className="bg-[#1E1E1E]">Cargando...</option>}
                                    {combos?.rol?.list.map(item => (
                                        <option key={item.id} value={item.id} className="bg-[#1E1E1E]">{item.nombre}</option>
                                    ))}
                                </select>
                            </div>


                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-8">
                            <div className="hidden md:block"></div>
                            <div className="space-y-1.5 flex flex-row w-full justify-end">
                                <div className="w-full md:w-[70%] flex flex-col md:flex-row gap-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/users')}
                                        className="px-8 py-2.5 rounded-lg text-gray-400 hover:text-white transition-all text-sm font-medium border border-transparent hover:border-gray-600 w-full md:w-auto text-center"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`px-10 py-2.5 rounded-lg bg-tivit-red hover:bg-red-600 text-white shadow-lg shadow-tivit-red/20 transition-all text-sm font-medium w-full md:w-auto ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {submitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
                                    </button>
                                </div>

                            </div>

                        </div>
                    </form>
                </div>
            </motion.div>
        </>
    );
};

export default CreateUser;
