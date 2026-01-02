import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { DocumentService, GuiaAereaResponse, GuiaAereaDataGridResponse } from '@/features/documents/services/documentService';
import UserLoadingOverlay from '@/features/users/components/UserLoadingOverlay';

const AirWaybillRectifyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const docState = location.state?.doc as GuiaAereaDataGridResponse;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const loadDocument = async () => {
            if (!docState?.guiaAereaId) {
                navigate('/air-waybills/rectify');
                return;
            }

            setLoading(true);
            try {
                // Fetch full details including confidence scores
                const fullDoc = await DocumentService.get(docState.guiaAereaId);

                // Flatten Intervinientes Confidence
                const remitente = fullDoc.intervinientesValidos?.find(i => i.rolCodigo === 'TPIN001');
                const consignatario = fullDoc.intervinientesValidos?.find(i => i.rolCodigo === 'TPIN002');

                setFormData({
                    ...fullDoc,
                    // Map all other confidence scores
                    confidenceFechaEmision: fullDoc.confidenceFechaEmision,
                    confidenceNumero: fullDoc.confidenceNumero,

                    confidenceOrigenCodigo: fullDoc.confidenceOrigenCodigo,
                    confidenceDestinoCodigo: fullDoc.confidenceDestinoCodigo,
                    confidenceAerolineaCodigo: fullDoc.confidenceAerolineaCodigo,
                    confidenceNumeroVuelo: fullDoc.confidenceNumeroVuelo,
                    confidenceFechaVuelo: fullDoc.confidenceFechaVuelo,
                    confidenceTransbordo: fullDoc.confidenceTransbordo,

                    confidenceDescripcionMercancia: fullDoc.confidenceDescripcionMercancia,
                    confidenceCantidadPiezas: fullDoc.confidenceCantidadPiezas,
                    confidencePesoBruto: fullDoc.confidencePesoBruto,
                    confidencePesoCobrado: fullDoc.confidencePesoCobrado,
                    confidenceUnidadPesoCodigo: fullDoc.confidenceUnidadPesoCodigo,
                    confidenceVolumen: fullDoc.confidenceVolumen,
                    confidenceNaturalezaCargaCodigo: fullDoc.confidenceNaturalezaCargaCodigo,
                    confidenceValorDeclarado: fullDoc.confidenceValorDeclarado,

                    confidenceTipoFleteCodigo: fullDoc.confidenceTipoFleteCodigo,
                    confidenceTarifaFlete: fullDoc.confidenceTarifaFlete,
                    confidenceOtrosCargos: fullDoc.confidenceOtrosCargos,
                    confidenceMonedaCodigo: fullDoc.confidenceMonedaCodigo,
                    confidenceTotalFlete: fullDoc.confidenceTotalFlete,

                    confidenceInstruccionesEspeciales: fullDoc.confidenceInstruccionesEspeciales,

                    // Flatten Intervinientes Confidence
                    confidenceNombreRemitente: remitente?.confidenceNombre,
                    confidenceDireccionRemitente: remitente?.confidenceDireccion,
                    confidenceTelefonoRemitente: remitente?.confidenceTelefono,

                    confidenceNombreConsignatario: consignatario?.confidenceNombre,
                    confidenceDireccionConsignatario: consignatario?.confidenceDireccion,
                    confidenceTelefonoConsignatario: consignatario?.confidenceTelefono,

                    // Extra fields
                    confidenceCiudadRemitente: remitente?.confidenceCiudad,
                    confidencePaisRemitente: remitente?.confidencePaisCodigo,
                    confidenceTipoDocRemitente: remitente?.confidenceTipoDocumentoCodigo,
                    confidenceNumDocRemitente: remitente?.confidenceNumeroDocumento,

                    confidenceCiudadConsignatario: consignatario?.confidenceCiudad,
                    confidencePaisConsignatario: consignatario?.confidencePaisCodigo,
                    confidenceTipoDocConsignatario: consignatario?.confidenceTipoDocumentoCodigo,
                    confidenceNumDocConsignatario: consignatario?.confidenceNumeroDocumento,

                    // Maintain existing flat fields if they were missing in fullDoc (fallback)
                    nombreRemitente: remitente?.nombre || fullDoc.intervinientesValidos?.[0]?.nombre || '',
                    direccionRemitente: remitente?.direccion || '',
                    telefonoRemitente: remitente?.telefono || '',
                    nombreConsignatario: consignatario?.nombre || '',
                    direccionConsignatario: consignatario?.direccion || '',
                    telefonoConsignatario: consignatario?.telefono || '',

                    ciudadRemitente: remitente?.ciudad || '',
                    paisRemitente: remitente?.paisCodigo || '',
                    tipoDocRemitente: remitente?.tipoDocumentoCodigo || '',
                    numDocRemitente: remitente?.numeroDocumento || '',

                    ciudadConsignatario: consignatario?.ciudad || '',
                    paisConsignatario: consignatario?.paisCodigo || '',
                    tipoDocConsignatario: consignatario?.tipoDocumentoCodigo || '',
                    numDocConsignatario: consignatario?.numeroDocumento || '',
                });
            } catch (error) {
                console.error("Error loading document:", error);
                alert("Error al cargar el documento.");
                navigate('/air-waybills/rectify');
            } finally {
                setLoading(false);
            }
        };

        loadDocument();
        // Data loaded
    }, [docState, navigate]);

    const getInputClassName = (baseClass: string, confidence?: number) => {
        // If confidence is null/undefined, it means low confidence (not saved essentially) or missing.
        // Alert if null.
        if (confidence === null || confidence === undefined) {
            return `${baseClass} border-red-500/50 bg-red-500/10 text-red-100 placeholder-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500`;
        }
        return baseClass;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveAndReprocess = async () => {
        setLoading(true);
        try {
            // 1. Construct the payload for saveOrUpdate (without files)
            // We need to map the flat structure back to the nested structure expected by the backend if strict,
            // or if the backend accepts the flat DTO.
            // Based on UploadAirWaybill, it expects a nested JSON with "intervinientes".
            // We need to reconstruct "intervinientes" from the flat fields (remitente/consignatario).

            const payload = {
                guiaAereaId: formData.guiaAereaId,
                numero: formData.numero,
                fechaEmision: formData.fechaEmision,

                origenCodigo: formData.origenCodigo,
                destinoCodigo: formData.destinoCodigo,
                transbordo: formData.transbordo,

                aerolineaCodigo: formData.aerolineaCodigo,
                numeroVuelo: formData.numeroVuelo,
                fechaVuelo: formData.fechaVuelo,

                descripcionMercancia: formData.descripcionMercancia,
                cantidadPiezas: Number(formData.cantidadPiezas),
                pesoBruto: Number(formData.pesoBruto),
                pesoCobrado: Number(formData.pesoCobrado),
                volumen: Number(formData.volumen),
                unidadPesoCodigo: formData.unidadPesoCodigo,
                naturalezaCargaCodigo: formData.naturalezaCargaCodigo,
                valorDeclarado: Number(formData.valorDeclarado),

                monedaCodigo: formData.monedaCodigo,
                tipoFleteCodigo: formData.tipoFleteCodigo,
                tarifaFlete: Number(formData.tarifaFlete),
                totalFlete: Number(formData.totalFlete),
                otrosCargos: Number(formData.otrosCargos),

                instruccionesEspeciales: formData.instruccionesEspeciales,
                observaciones: formData.observaciones,

                // Reconstruct Intervinientes
                intervinientes: [
                    {
                        nombre: formData.nombreRemitente,
                        direccion: formData.direccionRemitente,
                        telefono: formData.telefonoRemitente,
                        rolCodigo: 'TPIN001', // Remitente
                        ciudad: formData.ciudadRemitente,
                        paisCodigo: formData.paisRemitente,
                        tipoDocumentoCodigo: formData.tipoDocRemitente,
                        numeroDocumento: formData.numDocRemitente
                    },
                    {
                        nombre: formData.nombreConsignatario,
                        direccion: formData.direccionConsignatario,
                        telefono: formData.telefonoConsignatario,
                        rolCodigo: 'TPIN002', // Consignatario
                        ciudad: formData.ciudadConsignatario,
                        paisCodigo: formData.paisConsignatario,
                        tipoDocumentoCodigo: formData.tipoDocConsignatario,
                        numeroDocumento: formData.numDocConsignatario
                    }
                ]
            };

            const formDataObj = new FormData();
            // Wrap in array as backend saveOrUpdate expects list of requests in JSON
            formDataObj.append('requestForm', JSON.stringify([payload]));

            // 2. Save / Update
            await DocumentService.saveOrUpdate(formDataObj);

            // 3. Reprocess
            if (formData.guiaAereaId) {
                await DocumentService.reprocess(formData.guiaAereaId);
            }

            alert("Documento corregido y enviado a reprocesamiento exitosamente.");
            navigate('/air-waybills/rectify');

        } catch (error: any) {
            console.error("Error saving/reprocessing:", error);
            alert("Error al procesar: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    if (!docState) return null;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 md:px-6 lg:px-8 pt-6 font-nunito text-gray-200">
            {loading && <UserLoadingOverlay type="fullscreen" />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/air-waybills/rectify')}
                        className="p-2 bg-[#1E1E24] hover:bg-[#25252D] rounded-lg border border-[#2A2830] transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Subsanar Guía Aérea</h1>
                        <p className="text-xs text-gray-400">Edita la información incorrecta y reprocesa el documento</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/air-waybills/rectify')}
                        className="px-6 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveAndReprocess}
                        disabled={loading}
                        className="flex items-center gap-2 bg-tivit-red hover:bg-red-600 text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Guardar y Reprocesar
                    </button>
                </div>
            </div>

            {/* Legend / Info Banner - Professional & Elegant */}
            <div className="mb-8 rounded-xl border border-white/5 bg-[#1E1E24] p-4 flex items-center gap-4 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-200 tracking-tight">Verificación de Datos</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        El sistema ha marcado en <span className="text-red-300 font-medium">rojo suave</span> los campos con baja confianza de extracción. Por favor, revíselos antes de continuar.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 0. SYSTEM OBSERVATIONS (High Visibility) */}
                    {formData.observaciones && (
                        <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/50 p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] mb-6">
                            <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
                                <AlertTriangle size={24} />
                                Motivo de Revisión
                            </h3>
                            <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
                                <p className="text-white text-base font-medium leading-relaxed">
                                    {formData.observaciones}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 1. General Info & Route */}
                    <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Información de Ruta y Vuelo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Número de Guía</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={formData.numero || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors", formData.confidenceNumero)}
                                    title={formData.confidenceNumero === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha Emisión</label>
                                <input
                                    type="datetime-local"
                                    name="fechaEmision"
                                    value={formData.fechaEmision || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors", formData.confidenceFechaEmision)}
                                    title={formData.confidenceFechaEmision === null ? "Confianza baja o nula" : ""}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Aerolínea</label>
                                <input
                                    type="text"
                                    name="aerolineaCodigo"
                                    value={formData.aerolineaCodigo || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors", formData.confidenceAerolineaCodigo)}
                                    title={formData.confidenceAerolineaCodigo === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vuelo / Fecha</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="numeroVuelo"
                                    value={formData.numeroVuelo || ''}
                                    onChange={handleChange}
                                    placeholder="Num"
                                    className={getInputClassName("flex-1 bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors", formData.confidenceNumeroVuelo)}
                                    title={formData.confidenceNumeroVuelo === null ? "Confianza baja o nula" : ""}
                                />
                                <input
                                    type="datetime-local"
                                    name="fechaVuelo"
                                    value={formData.fechaVuelo || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-48 bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors", formData.confidenceFechaVuelo)}
                                    title={formData.confidenceFechaVuelo === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>
                    </div>


                    {/* 2. Cargo Details */}
                    <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            Detalles de la Carga
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Piezas</label>
                                <input
                                    type="number"
                                    name="cantidadPiezas"
                                    value={formData.cantidadPiezas || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors", formData.confidenceCantidadPiezas)}
                                    title={formData.confidenceCantidadPiezas === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Peso Bruto / Unidad</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="pesoBruto"
                                        value={formData.pesoBruto || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("flex-1 bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors", formData.confidencePesoBruto)}
                                        title={formData.confidencePesoBruto === null ? "Confianza baja o nula" : ""}
                                    />
                                    <input
                                        type="text"
                                        name="unidadPesoCodigo"
                                        value={formData.unidadPesoCodigo || 'KG'}
                                        onChange={handleChange}
                                        className={getInputClassName("w-20 bg-[#141419] border border-white/5 rounded-lg px-2 py-2 text-white text-sm text-center focus:border-purple-500 outline-none transition-colors", formData.confidenceUnidadPesoCodigo)}
                                        title={formData.confidenceUnidadPesoCodigo === null ? "Confianza baja o nula" : ""}
                                        placeholder="KG"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Peso Cobrado</label>
                                <input
                                    type="number"
                                    name="pesoCobrado"
                                    value={formData.pesoCobrado || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors", formData.confidencePesoCobrado)}
                                    title={formData.confidencePesoCobrado === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Volumen y Dimensiones</label>
                                <input
                                    type="number"
                                    name="volumen"
                                    value={formData.volumen || ''}
                                    onChange={handleChange}
                                    placeholder="Volumen Total"
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors", formData.confidenceVolumen)}
                                    title={formData.confidenceVolumen === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Naturaleza de la Carga</label>
                                <input
                                    type="text"
                                    name="naturalezaCargaCodigo"
                                    value={formData.naturalezaCargaCodigo || ''}
                                    onChange={handleChange}
                                    placeholder=""
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors", formData.confidenceNaturalezaCargaCodigo)}
                                    title={formData.confidenceNaturalezaCargaCodigo === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción de Mercancía</label>
                            <textarea
                                name="descripcionMercancia"
                                value={formData.descripcionMercancia || ''}
                                onChange={handleChange}
                                rows={3}
                                className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 outline-none transition-colors resize-none", formData.confidenceDescripcionMercancia)}
                                title={formData.confidenceDescripcionMercancia === null ? "Confianza baja o nula" : ""}
                            />
                        </div>
                    </div>

                    {/* 3. Financial Info */}
                    <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Información Financiera
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Moneda</label>
                                <input
                                    type="text"
                                    name="monedaCodigo"
                                    value={formData.monedaCodigo || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors", formData.confidenceMonedaCodigo)}
                                    title={formData.confidenceMonedaCodigo === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo Flete</label>
                                <input
                                    type="text"
                                    name="tipoFleteCodigo"
                                    value={formData.tipoFleteCodigo || ''}
                                    onChange={handleChange}
                                    placeholder="PP / CC"
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors", formData.confidenceTipoFleteCodigo)}
                                    title={formData.confidenceTipoFleteCodigo === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Valor Declarado</label>
                                <input
                                    type="number"
                                    name="valorDeclarado"
                                    value={formData.valorDeclarado || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors", formData.confidenceValorDeclarado)}
                                    title={formData.confidenceValorDeclarado === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Flete</label>
                                <input
                                    type="number"
                                    name="totalFlete"
                                    value={formData.totalFlete || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-emerald-500 outline-none transition-colors", formData.confidenceTotalFlete)}
                                    title={formData.confidenceTotalFlete === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tarifa / Rate</label>
                                <input
                                    type="number"
                                    name="tarifaFlete"
                                    value={formData.tarifaFlete || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors", formData.confidenceTarifaFlete)}
                                    title={formData.confidenceTarifaFlete === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Otros Cargos</label>
                                <input
                                    type="number"
                                    name="otrosCargos"
                                    value={formData.otrosCargos || ''}
                                    onChange={handleChange}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors", formData.confidenceOtrosCargos)}
                                    title={formData.confidenceOtrosCargos === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (4 cols) - Actors & Obs */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Actors */}
                    <div className="bg-[#1E1E24] rounded-xl border border-white/5 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            Intervinientes
                        </h3>

                        {/* Shipper */}
                        <div className="mb-6 pb-6 border-b border-white/5">
                            <label className="block text-xs font-semibold text-orange-500 mb-3">Remitente</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombreRemitente"
                                        value={formData.nombreRemitente || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceNombreRemitente)}
                                        title={formData.confidenceNombreRemitente === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo Doc.</label>
                                        <input
                                            type="text"
                                            name="tipoDocRemitente"
                                            value={formData.tipoDocRemitente || ''}
                                            onChange={handleChange}
                                            placeholder="RUC"
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceTipoDocRemitente)}
                                            title={formData.confidenceTipoDocRemitente === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">No. Documento</label>
                                        <input
                                            type="text"
                                            name="numDocRemitente"
                                            value={formData.numDocRemitente || ''}
                                            onChange={handleChange}
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceNumDocRemitente)}
                                            title={formData.confidenceNumDocRemitente === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccionRemitente"
                                        value={formData.direccionRemitente || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceDireccionRemitente)}
                                        title={formData.confidenceDireccionRemitente === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ciudad</label>
                                        <input
                                            type="text"
                                            name="ciudadRemitente"
                                            value={formData.ciudadRemitente || ''}
                                            onChange={handleChange}
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceCiudadRemitente)}
                                            title={formData.confidenceCiudadRemitente === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">País</label>
                                        <input
                                            type="text"
                                            name="paisRemitente"
                                            value={formData.paisRemitente || ''}
                                            onChange={handleChange}
                                            placeholder="PE"
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidencePaisRemitente)}
                                            title={formData.confidencePaisRemitente === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefonoRemitente"
                                        value={formData.telefonoRemitente || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceTelefonoRemitente)}
                                        title={formData.confidenceTelefonoRemitente === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consignee */}
                        <div>
                            <label className="block text-xs font-semibold text-orange-500 mb-3">Consignatario</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombreConsignatario"
                                        value={formData.nombreConsignatario || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceNombreConsignatario)}
                                        title={formData.confidenceNombreConsignatario === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo Doc.</label>
                                        <input
                                            type="text"
                                            name="tipoDocConsignatario"
                                            value={formData.tipoDocConsignatario || ''}
                                            onChange={handleChange}
                                            placeholder="RUC/DNI"
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceTipoDocConsignatario)}
                                            title={formData.confidenceTipoDocConsignatario === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">No. Documento</label>
                                        <input
                                            type="text"
                                            name="numDocConsignatario"
                                            value={formData.numDocConsignatario || ''}
                                            onChange={handleChange}
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceNumDocConsignatario)}
                                            title={formData.confidenceNumDocConsignatario === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccionConsignatario"
                                        value={formData.direccionConsignatario || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceDireccionConsignatario)}
                                        title={formData.confidenceDireccionConsignatario === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ciudad</label>
                                        <input
                                            type="text"
                                            name="ciudadConsignatario"
                                            value={formData.ciudadConsignatario || ''}
                                            onChange={handleChange}
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceCiudadConsignatario)}
                                            title={formData.confidenceCiudadConsignatario === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">País</label>
                                        <input
                                            type="text"
                                            name="paisConsignatario"
                                            value={formData.paisConsignatario || ''}
                                            onChange={handleChange}
                                            placeholder="PE"
                                            className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidencePaisConsignatario)}
                                            title={formData.confidencePaisConsignatario === null ? "Confianza baja o nula" : ""}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefonoConsignatario"
                                        value={formData.telefonoConsignatario || ''}
                                        onChange={handleChange}
                                        className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none transition-colors", formData.confidenceTelefonoConsignatario)}
                                        title={formData.confidenceTelefonoConsignatario === null ? "Confianza baja o nula" : ""}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Observations */}
                    <div className="bg-[#1E1E24] rounded-xl border border-yellow-500/20 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Observaciones
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Instrucciones Especiales (Editar)</label>
                                <textarea
                                    name="instruccionesEspeciales"
                                    value={formData.instruccionesEspeciales || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    className={getInputClassName("w-full bg-[#141419] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 outline-none transition-colors resize-none", formData.confidenceInstruccionesEspeciales)}
                                    title={formData.confidenceInstruccionesEspeciales === null ? "Confianza baja o nula" : ""}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
};

export default AirWaybillRectifyPage;
