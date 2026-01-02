import api from '@/api/axios';

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserResetPassword {
    email: string;
    code: string;
    new_password: string;
    confirm_password?: string;
}

export const AuthService = {
    login: async (credentials: UserLogin): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<any> => {
        const response = await api.post<any>('/auth/forgot-password', { email });
        return response.data;
    },

    verifyCode: async (email: string, code: string): Promise<any> => {
        const response = await api.post<any>('/auth/verify-code', { email, code });
        return response.data;
    },

    getMe: async (): Promise<any> => {
        const response = await api.get<any>('/auth/me');
        return response.data;
    },

    resetPassword: async (data: any): Promise<any> => {
        const response = await api.post<any>('/auth/reset-password', data);
        return response.data;
    },

    changePassword: async (new_password: string): Promise<any> => {
        // Authenticated password change
        const response = await api.post<any>('/auth/change-password', { new_password });
        return response.data;
    }
};
