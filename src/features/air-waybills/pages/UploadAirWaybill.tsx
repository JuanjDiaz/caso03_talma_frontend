import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Save, ArrowLeft } from 'lucide-react';
import { DocumentService } from '@/features/documents/services/documentService';
import UserLoadingOverlay from '@/features/users/components/UserLoadingOverlay';

const UploadAirWaybill: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [jsonContent, setJsonContent] = useState<string>(`[
  {
    "numero": "200-88990011",
    "fechaEmision": "2025-07-22T13:40:00",
    "estadoGuiaCodigo": "REVISION_MANUAL",
    "origenCodigo": "JAU",
    "destinoCodigo": "CDG",
    "transbordo": "MAD",
    "aerolineaCodigo": "AF",
    "numeroVuelo": "AF4832",
    "fechaVuelo": "2025-07-24T00:55:00",
    "descripcionMercancia": "Alimentos procesados enlatados",
    "cantidadPiezas": 210,
    "pesoBruto": 3650.00,
    "pesoCobrado": 3605.00,
    "unidadPesoCodigo": "KG",
    "volumen": 19.30,
    "naturalezaCargaCodigo": "GENERAL",
    "valorDeclarado": 45800.00,
    "tipoFleteCodigo": "PREPAGADO",
    "tarifaFlete": 4980.00,
    "otrosCargos": 520.00,
    "monedaCodigo": "EUR",
    "totalFlete": 5500.00,
    "instruccionesEspeciales": "Evitar exposición prolongada al calor",
    "observaciones": "Algunos campos requieren validación manual",
    "intervinientes": [
      {
        "nombre": "Industrias Alimentarias del Centro S.A.",
        "direccion": "Av. Producción 450",
        "ciudad": "Huancayo",
        "paisCodigo": "PE",
        "telefono": "+51 964112233",
        "tipoDocumentoCodigo": "RUC",
        "numeroDocumento": "20901234567",
        "tipoCodigo": "TPIN001"
      },
      {
        "nombre": "Continental Food Traders SAS",
        "direccion": "88 Rue du Commerce",
        "ciudad": "Paris",
        "paisCodigo": "FR",
        "telefono": "+33 144556677",
        "tipoDocumentoCodigo": "VAT_ID",
        "numeroDocumento": "FR-55667788",
        "tipoCodigo": "TPIN002"
      }
    ],
    "confianzas": [
      { "nombreCampo": "numero", "valorExtraido": "200-88990011", "confidenceModelo": 0.97 },
      { "nombreCampo": "fechaEmision", "valorExtraido": "2025-07-22T13:40:00", "confidenceModelo": 0.95 },
      { "nombreCampo": "remitente.nombre", "valorExtraido": "Industrias Alimentarias del Centro S.A.", "confidenceModelo": 0.96 }
    ]
  }
]`);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        try {
            JSON.parse(jsonContent);
        } catch (error) {
            alert("El contenido JSON no es válido.");
            return;
        }

        if (files.length === 0) {
            alert("Debes adjuntar al menos un archivo (PDF/imagen).");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            formData.append('requestForm', jsonContent);

            const response = await DocumentService.saveOrUpdate(formData);

            // Show success logic (e.g. toast) or redirect
            alert(`Éxito: ${response.mensaje}`);
            navigate('/air-waybills');

        } catch (error: any) {
            console.error("Upload error:", error);
            const msg = error.response?.data?.message || error.message || "Error al procesar la solicitud.";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full font-nunito text-gray-200">
            {loading && <UserLoadingOverlay type="fullscreen" />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/air-waybills')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600 text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-medium text-white mb-1">Registro de Guías</h1>
                    <p className="text-xs font-medium text-gray-300">Carga masiva de documentos y metadata</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* JSON Editor */}
                <div className="bg-[#1f2937] p-6 rounded-lg border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-[#6366f1]" />
                        Metadata (JSON)
                    </h3>

                    <div className="relative">
                        <textarea
                            value={jsonContent}
                            onChange={(e) => setJsonContent(e.target.value)}
                            className="w-full h-[500px] bg-[#111827] border border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-300 focus:ring-[#6366f1] focus:border-[#6366f1] resize-none"
                            spellCheck={false}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    try {
                                        const parsed = JSON.parse(jsonContent);
                                        setJsonContent(JSON.stringify(parsed, null, 2));
                                    } catch {
                                        // Ignore format errors here
                                    }
                                }}
                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                            >
                                Prettify
                            </button>
                        </div>
                    </div>
                </div>

                {/* File Upload & Actions */}
                <div className="space-y-6">
                    <div className="bg-[#1f2937] p-6 rounded-lg border border-gray-700 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-green-500" />
                            Archivos Adjuntos
                        </h3>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-300"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                            </div>
                            <input type="file" className="hidden" multiple onChange={handleFileChange} />
                        </label>

                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm text-gray-200 truncate font-medium">{file.name}</span>
                                                <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(idx)}
                                            className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 text-white bg-[#6366f1] hover:bg-[#4f46e5] focus:ring-4 focus:ring-[#6366f1]/50 font-medium rounded-lg text-sm px-5 py-4 transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                <Save size={20} />
                                Guardar Todo
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadAirWaybill;
