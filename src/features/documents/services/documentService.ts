import api from '@/api/axios';

export interface GuiaAereaFiltroRequest {
    start?: number;
    limit?: number;
    sort?: string;
    palabraClave?: string;
    totalCount?: number;
    numero?: string;
    origenCodigo?: string;
    destinoCodigo?: string;
    transbordo?: string;
    nombreRemitente?: string;
    nombreConsignatario?: string;
    habilitado?: boolean;
    fechaInicioRegistro?: string;
    fechaFinRegistro?: string;
    vistaCodigo?: string;
}

export interface GuiaAereaDataGridResponse {
    guiaAereaId?: string;
    remitenteId?: string;
    nombreRemitente?: string;
    direccionRemitente?: string;
    telefonoRemitente?: string;
    consignatarioId?: string;
    nombreConsignatario?: string;
    direccionConsignatario?: string;
    telefonoConsignatario?: string;
    numero?: string;
    tipoCodigo?: string;
    tipo?: string;
    fechaEmision?: string;
    estadoGuiaCodigo?: string;
    origenCodigo?: string;
    destinoCodigo?: string;
    transbordo?: string;
    aerolineaCodigo?: string;
    numeroVuelo?: string;
    fechaVuelo?: string;
    descripcionMercancia?: string;
    cantidadPiezas?: number;
    pesoBruto?: number;
    pesoCobrado?: number;
    unidadPesoCodigo?: string;
    volumen?: number;
    naturalezaCargaCodigo?: string;
    valorDeclarado?: number;
    tipoFleteCodigo?: string;
    tarifaFlete?: number;
    otrosCargos?: number;
    monedaCodigo?: string;
    totalFlete?: number;
    instruccionesEspeciales?: string;
    observaciones?: string;
    estadoRegistroCodigo?: string;
    confidenceTotalPct?: string;
    estadoConfianzaCodigo?: string;
    estadoConfianza?: string;
    estadoRegistro?: string;
    habilitado?: boolean;
    fechaConsulta?: string;
}

export interface CollectionResponse<T> {
    data: T[];
    total: number;
}

export interface BaseOperacionResponse {
    codigo: string;
    mensaje: string;
}


export interface GuiaAereaIntervinienteResponse {
    guiaAereaIntervinienteId?: string;
    guiaAereaId?: string;
    intervinienteId?: string;
    rolCodigo?: string;
    nombre?: string;
    confidenceNombre?: number;
    direccion?: string;
    confidenceDireccion?: number;
    ciudad?: string;
    confidenceCiudad?: number;
    paisCodigo?: string;
    confidencePaisCodigo?: number;
    telefono?: string;
    confidenceTelefono?: number;
    tipoDocumentoCodigo?: string;
    confidenceTipoDocumentoCodigo?: number;
    numeroDocumento?: string;
    confidenceNumeroDocumento?: number;
}

export interface GuiaAereaResponse {
    guiaAereaId?: string;
    numero?: string;
    confidenceNumero?: number;
    tipoCodigo?: string;
    fechaEmision?: string;
    confidenceFechaEmision?: number;
    origenCodigo?: string;
    confidenceOrigenCodigo?: number;
    destinoCodigo?: string;
    confidenceDestinoCodigo?: number;
    transbordo?: string;
    confidenceTransbordo?: number;
    aerolineaCodigo?: string;
    confidenceAerolineaCodigo?: number;
    numeroVuelo?: string;
    confidenceNumeroVuelo?: number;
    fechaVuelo?: string;
    confidenceFechaVuelo?: number;
    descripcionMercancia?: string;
    confidenceDescripcionMercancia?: number;
    cantidadPiezas?: number;
    confidenceCantidadPiezas?: number;
    pesoBruto?: number;
    confidencePesoBruto?: number;
    pesoCobrado?: number;
    confidencePesoCobrado?: number;
    unidadPesoCodigo?: string;
    confidenceUnidadPesoCodigo?: number;
    volumen?: number;
    confidenceVolumen?: number;
    naturalezaCargaCodigo?: string;
    confidenceNaturalezaCargaCodigo?: number;
    valorDeclarado?: number;
    confidenceValorDeclarado?: number;
    tipoFleteCodigo?: string;
    confidenceTipoFleteCodigo?: number;
    tarifaFlete?: number;
    confidenceTarifaFlete?: number;
    otrosCargos?: number;
    confidenceOtrosCargos?: number;
    monedaCodigo?: string;
    confidenceMonedaCodigo?: number;
    totalFlete?: number;
    confidenceTotalFlete?: number;
    instruccionesEspeciales?: string;
    confidenceInstruccionesEspeciales?: number;
    observaciones?: string;
    confidenceTotal?: number;
    intervinientesValidos?: GuiaAereaIntervinienteResponse[];
}

export const DocumentService = {

    get: async (id: string): Promise<GuiaAereaResponse> => {
        const response = await api.get<GuiaAereaResponse>(`/document/get/${id}`);
        return response.data;
    },

    saveOrUpdate: async (formData: FormData): Promise<BaseOperacionResponse> => {
        const response = await api.post<BaseOperacionResponse>('/document/saveOrUpdate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Finds documents using server-side streaming.
     * @param request Filter parameters
     * @param onChunk Callback function that receives new items as they arrive
     * @returns Final CollectionResponse with total count
     */
    find: async (request: GuiaAereaFiltroRequest): Promise<CollectionResponse<GuiaAereaDataGridResponse>> => {
        const response = await api.post<any>('/document/find', request);
        return {
            data: response.data.elements || [],
            total: response.data.totalCount || 0
        };
    },

    reprocess: async (documentId: string): Promise<BaseOperacionResponse> => {
        const response = await api.post<BaseOperacionResponse>(`/document/reprocess/${documentId}`);
        return response.data;
    }
};
