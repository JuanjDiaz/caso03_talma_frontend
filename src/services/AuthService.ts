import api from '../api/axios';

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const AuthService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    getMe: async (): Promise<any> => {
        const response = await api.get<any>('/auth/me');
        return response.data;
    }
};
