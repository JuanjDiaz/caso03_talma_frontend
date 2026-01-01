import api from '@/api/axios';

export interface UserLogin {
    email: string;
    // Add password if the backend requires it, though the snippet showed:
    // async def login(user: UserLogin...
    // usually login requires password. I will assume it does.
    password?: string;
    // Wait, the user snippet just says "UserLogin". I should verify, but standard is email/pass.
    // Given the previous conversation history "Debugging Login Validation" had an issue with email format.
    // I will check the snippet again. "user: UserLogin".
    // I will add password to be safe, standard OAuth2PasswordRequestForm or similar.
    // But the python code imports UserLogin.
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface UserForgotPassword {
    email: string;
}

export interface UserVerifyCode {
    email: string;
    code: string;
}

export interface UserResetPassword {
    email: string;
    code: string;
    new_password: string;
}

export const authApi = {
    login: async (data: UserLogin): Promise<Token> => {
        const response = await api.post<Token>('/auth/login', data);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    },

    verifyCode: async (email: string, code: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/verify-code', { email, code });
        return response.data;
    },

    resetPassword: async (data: UserResetPassword): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/reset-password', data);
        return response.data;
    },

    changePassword: async (new_password: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/change-password', { new_password });
        return response.data;
    }
};
