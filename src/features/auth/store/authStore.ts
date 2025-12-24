import { create } from 'zustand';

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
    login: (email: string) => Promise<void>;
    logout: () => void;
    setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({
                user: { email, name: 'Tivit User' },
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            set({ error: 'Failed to login', isLoading: false });
        }
    },

    logout: () => set({ user: null, isAuthenticated: false }),
    setError: (error) => set({ error })
}));
