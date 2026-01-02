import api from '@/api/axios';

export interface ComboItem {
    id?: string;
    codigo?: string;
    nombre?: string;
}

export interface ComboResponse {
    list: ComboItem[];
    size: number;
}

export interface UsuarioComboResponse {
    tipoDocumento?: ComboResponse;
    rol?: ComboResponse;
}

export interface UsuarioRequest {
    usuarioId?: string;
    rolId?: string;
    primerNombre?: string;
    segundoNombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correo?: string;
    celular?: string;
    tipoDocumentoCodigo?: string;
    documento?: string;
}

export interface BaseOperacionResponse {
    codigo: string;
    mensaje: string;
}

export const UserService = {
    initForm: async (): Promise<UsuarioComboResponse> => {
        const response = await api.get<UsuarioComboResponse>('/usuario/initForm');
        return response.data;
    },

    saveOrUpdate: async (data: UsuarioRequest): Promise<BaseOperacionResponse> => {
        const response = await api.post<BaseOperacionResponse>('/usuario/saveOrUpdate', data);
        return response.data;
    },

    changeStatus: async (usuarioId: string, habilitado: boolean): Promise<BaseOperacionResponse> => {
        const response = await api.post<BaseOperacionResponse>('/usuario/changeStatus', { usuarioId, habilitado });
        return response.data;
    },

    getById: async (id: string): Promise<UsuarioFiltroResponse> => {
        const response = await api.get<UsuarioFiltroResponse>(`/usuario/${id}`);
        return response.data;
    },

    find: async (request: UsuarioFiltroRequest): Promise<CollectionResponse<UsuarioFiltroResponse>> => {
        const response = await api.post<any>('/usuario/find', request);
        // Map backend "elements" to frontend "data" and "totalCount" to "total"
        return {
            data: response.data.elements || [],
            total: response.data.totalCount || 0
        };
    },

    updatePassword: async (password: string, confirmPassword: string): Promise<BaseOperacionResponse> => {
        const response = await api.post<BaseOperacionResponse>('/usuario/updatePassword', {
            password: password,
            confirmarPassword: confirmPassword
        });
        return response.data;
    }
};

export interface BaseRequest {
    start?: number;
    limit?: number;
    sort?: string;
    palabraClave?: string;
    totalCount?: number;
}

export interface UsuarioFiltroRequest extends BaseRequest {
    nombre?: string;
    rolCodigo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    habilitado?: boolean;
}

export interface UsuarioFiltroResponse {
    usuarioId?: string;
    nombreCompleto?: string;
    correo?: string;
    celular?: string;
    rolCodigo?: string;
    rol?: string;
    tipoDocumento?: string;
    documento?: string;
    estado?: string;
    creado?: string;
}

export interface CollectionResponse<T> {
    data: T[];
    total: number;
}
