import api from '../api/axios';

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

export const DocumentService = {

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
