import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plane, User, Package, DollarSign,
    FileText, ShieldCheck, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GuiaAereaDataGridResponse } from '../../services/documentService';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const InfoCard = ({ title, icon: Icon, children, className = "", delay = 0 }: any) => (
    <motion.div
        variants={itemVariants}
        className={`bg-[#0F1115]/80 border border-white/5 rounded-2xl p-6 backdrop-blur-md hover:border-white/10 transition-colors duration-300 ${className}`}
    >
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-white/5 rounded-lg text-tivit-red border border-white/5 shadow-sm">
                <Icon size={18} />
            </div>
            <h3 className="text-white font-medium text-base tracking-wide">{title}</h3>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </motion.div>
);

const InfoRow = ({ label, value, subValue, highlight = false }: any) => (
    <div className="flex flex-col gap-1.5 group">
        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold group-hover:text-gray-400 transition-colors">{label}</span>
        <div className={`text-sm break-all font-medium ${highlight ? 'text-white text-lg tracking-tight' : 'text-gray-200'}`}>
            {value || <span className="text-gray-600 font-normal italic">No registrado</span>}
        </div>
        {subValue && <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded w-fit">{subValue}</span>}
    </div>
);

const AirWaybillDetailPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const doc = location.state?.doc as GuiaAereaDataGridResponse;

    useEffect(() => {
        if (!doc) {
            navigate('/air-waybills');
        }
    }, [doc, navigate]);

    if (!doc) return null;

    const formatCurrency = (val: any) => {
        if (val === undefined || val === null) return '0.00';
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const formatNumber = (val: any, decimals: number = 2) => {
        if (val === undefined || val === null) return '-';
        const num = Number(val);
        if (isNaN(num)) return val;
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    };

    const getConfidenceBadge = (confidenceText?: string, pctString?: string) => {
        // Fallbacks
        const text = confidenceText || "No Calculado";
        const pctText = pctString || "0%";

        // Color logic based on percentage
        const val = parseFloat(pctText.replace('%', ''));

        let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        let Icon = ShieldCheck;

        if (val < 95) {
            colorClass = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        }
        if (val < 60) {
            colorClass = "text-red-400 bg-red-500/10 border-red-500/20";
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border ${colorClass} shadow-lg shadow-black/20`}
            >
                <Icon size={16} />
                <div className="flex flex-col leading-none">
                    <span className="font-mono text-sm font-bold tracking-tight uppercase">{text}</span>
                    <span className="text-[9px] opacity-70 uppercase tracking-widest font-semibold flex items-center gap-1">
                        Confianza <span className="opacity-50">•</span> {pctText}
                    </span>
                </div>
            </motion.div>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No registrado';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const getCycleBadge = (code?: string) => {
        const styles: Record<string, string> = {
            "ESTGA001": "bg-blue-500/10 text-blue-400 border-blue-500/20", // PROCESANDO
            "ESTGA002": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", // OBSERVADO
            "ESTGA003": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", // PROCESADO
            "ESTGA004": "bg-purple-500/10 text-purple-400 border-purple-500/20", // ENVIADO
            "ESTGA005": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", // ACEPTADO
            "ESTGA006": "bg-red-500/10 text-red-400 border-red-500/20",     // RECHAZADO
        };

        const labels: Record<string, string> = {
            "ESTGA001": "Procesando",
            "ESTGA002": "Observado",
            "ESTGA003": "Procesado",
            "ESTGA004": "Enviado",
            "ESTGA005": "Aceptado",
            "ESTGA006": "Rechazado",
        };

        const style = styles[code || ""] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
        const label = labels[code || ""] || code || "Desconocido";

        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${style}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${style.split(' ')[1].replace('text-', 'bg-')} animate-pulse`}></div>
                {label}
            </span>
        );
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto pb-12 px-4 md:px-6 lg:px-8 pt-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Nav & Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-all group px-3 py-2 rounded-lg hover:bg-white/5 w-fit"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Volver al listado</span>
                </button>

                {getConfidenceBadge(doc.estadoConfianza, doc.confidenceTotalPct)}
            </div>

            {/* Hero Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-[#12141A] to-[#0A0B0E] border border-white/5 rounded-3xl p-5 md:p-8 relative overflow-hidden mb-8 shadow-2xl"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-tivit-red/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
                    <div className="space-y-4 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/10 text-gray-200 border border-white/5 shadow-inner">
                                {doc.tipo || 'GUÍA AÉREA'}
                            </span>
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${doc.habilitado ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${doc.habilitado ? 'bg-emerald-400' : 'bg-red-500'} animate-pulse`}></div>
                                {doc.habilitado ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                            {/* Lifecycle Badge */}
                            {getCycleBadge(doc.estadoRegistroCodigo)}
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white font-mono tracking-tight mb-2 flex flex-wrap items-center gap-2 md:gap-3 break-all">
                                {doc.numero}
                                <span className="text-base md:text-xl text-gray-600 font-sans font-normal opacity-50 select-none whitespace-nowrap">/ MAWB</span>
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm flex items-center gap-2">
                                <FileText size={14} className="text-gray-500" />
                                Registrado el <span className="text-gray-300 font-medium">{formatDate(doc.fechaConsulta)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-12 bg-black/20 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner w-full md:w-auto justify-between md:justify-start">
                        <div className="text-center min-w-[3rem]">
                            <div className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">{doc.origenCodigo || '???'}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Origen</div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1 relative w-16 md:w-24">
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-tivit-red/50 to-transparent"></div>
                            <Plane size={20} className="text-tivit-red absolute -top-2.5 md:-top-3 rotate-90 drop-shadow-[0_0_8px_rgba(237,28,36,0.5)]" />
                            <div className="hidden md:block text-[9px] text-tivit-red/80 font-mono mt-2 tracking-wider">VUELO DIRECTO</div>
                        </div>

                        <div className="text-center min-w-[3rem]">
                            <div className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">{doc.destinoCodigo || '???'}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Destino</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                {/* Left Column (Main Info) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">

                    {/* 1. Información de Vuelo y Ruta */}
                    <div className="md:col-span-2">
                        <InfoCard title="Detalles del Vuelo Aéreo" icon={MapPin}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <InfoRow label="Aerolínea" value={doc.aerolineaCodigo} />
                                <InfoRow label="F. Vuelo" value={formatDate(doc.fechaVuelo)} />
                                <div className="md:col-start-3 md:col-span-2">
                                    <InfoRow label="Nro. Vuelo" value={doc.numeroVuelo} highlight />
                                </div>
                                {doc.transbordo && (
                                    <div className="col-span-2 md:col-span-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
                                        <div className="p-1 bg-yellow-500/10 rounded text-yellow-500 mt-0.5"><MapPin size={14} /></div>
                                        <div>
                                            <span className="text-[10px] uppercase text-yellow-500/70 font-bold tracking-wider">Ruta / Transbordo</span>
                                            <div className="text-sm font-medium text-yellow-100">{doc.transbordo}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    </div>

                    {/* 2. Actores (Remitente / Consignatario) */}
                    <InfoCard title="Remitente (Shipper)" icon={User}>
                        <div className="space-y-4">
                            <InfoRow label="Nombre / Razón Social" value={doc.nombreRemitente} highlight />
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <InfoRow label="Teléfono" value={doc.telefonoRemitente} />
                                <div className="col-span-2">
                                    <InfoRow label="Dirección" value={doc.direccionRemitente} />
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    <InfoCard title="Consignatario (Consignee)" icon={User}>
                        <div className="space-y-4">
                            <InfoRow label="Nombre / Razón Social" value={doc.nombreConsignatario} highlight />
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <InfoRow label="Teléfono" value={doc.telefonoConsignatario} />
                                <div className="col-span-2">
                                    <InfoRow label="Dirección" value={doc.direccionConsignatario} />
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    {/* 5. Observaciones adicionales */}
                    <motion.div variants={itemVariants} className="md:col-span-2 bg-[#0F1115]/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                            <FileText size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Notas Adicionales</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-medium text-gray-400 mb-2 transform uppercase tracking-wider">Instrucciones Especiales</h4>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm text-gray-300 min-h-[60px] leading-relaxed">
                                    {doc.instruccionesEspeciales || <span className="text-gray-600 italic">No registradas</span>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-gray-400 mb-2 transform uppercase tracking-wider">Observaciones Generales</h4>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm text-gray-300 min-h-[60px] leading-relaxed">
                                    {doc.observaciones || <span className="text-gray-600 italic">No registradas</span>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (Details & Finance) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 3. Detalles de Carga */}
                    <InfoCard title="Carga y Mercancía" icon={Package} className="bg-gradient-to-br from-[#121318] to-[#0A0A0C]">
                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <InfoRow label="Descripción de Mercancía" value={doc.descripcionMercancia} highlight />
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <InfoRow label="Piezas" value={formatNumber(doc.cantidadPiezas, 0)} />
                                <InfoRow label="Volumen" value={formatNumber(doc.volumen)} subValue="M³" />
                                <InfoRow label="Peso Bruto" value={formatNumber(doc.pesoBruto)} subValue={doc.unidadPesoCodigo || 'KG'} />
                                <InfoRow label="Peso Cobrable" value={formatNumber(doc.pesoCobrado)} subValue={doc.unidadPesoCodigo || 'KG'} />
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <InfoRow label="Naturaleza" value={doc.naturalezaCargaCodigo} />
                            </div>
                        </div>
                    </InfoCard>

                    {/* 4. Información Financiera */}
                    <InfoCard title="Finanzas & Fletes" icon={DollarSign}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Moneda</span>
                                <span className="text-lg font-mono font-medium text-white">{doc.monedaCodigo || 'USD'}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Tipo Pago</span>
                                <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-bold border border-blue-500/20 mt-1">
                                    {doc.tipoFleteCodigo || 'PP'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-400 font-medium">Tarifa Flete</span>
                                <span className="text-white font-mono">{formatCurrency(doc.tarifaFlete)}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-400 font-medium">Otros Cargos</span>
                                <span className="text-white font-mono">{formatCurrency(doc.otrosCargos)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2 w-full"></div>
                            <div className="flex justify-between text-base items-end">
                                <span className="text-tivit-red font-bold text-sm uppercase tracking-wide">Total Estimado</span>
                                <span className="font-mono text-xl font-bold text-white tracking-tight">{formatCurrency(doc.totalFlete)}</span>
                            </div>
                        </div>

                        {doc.valorDeclarado && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-yellow-500 bg-yellow-500/5 py-2.5 rounded-lg border border-yellow-500/10 font-medium">
                                <ShieldCheck size={14} />
                                Valor Declarado Aduana: {formatCurrency(doc.valorDeclarado)}
                            </div>
                        )}
                    </InfoCard>

                </div>
            </div>
        </motion.div>
    );
};

export default AirWaybillDetailPage;
