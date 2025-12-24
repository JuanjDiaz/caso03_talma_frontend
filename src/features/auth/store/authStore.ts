import { create } from 'zustand';
import { authApi, UserLogin, UserResetPassword } from '../api/authApi';

interface User {
    email: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (data: UserLogin) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    verifyCode: (email: string, code: string) => Promise<void>;
    resetPassword: (data: UserResetPassword) => Promise<void>;
    logout: () => void;
    setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (data: UserLogin) => {
        set({ isLoading: true, error: null });
        try {
            const token = await authApi.login(data);
            localStorage.setItem('token', token.access_token);

            // Should properly decode token or fetch user info here. 
            // For now, using the email from login.
            set({
                user: { email: data.email },
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Login failed:', error);
            set({
                error: error.response?.data?.detail || 'Error al iniciar sesión',
                isLoading: false
            });
            throw error;
        }
    },

    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.forgotPassword(email);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Error al enviar código',
                isLoading: false
            });
            throw error;
        }
    },

    verifyCode: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.verifyCode(email, code);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Código inválido',
                isLoading: false
            });
            throw error;
        }
    },

    resetPassword: async (data: UserResetPassword) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.resetPassword(data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Error al restablecer contraseña',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
    },
    setError: (error) => set({ error })
}));
