import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
});

// Interceptor para añadir el JWT a cada petición
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // 1. Try getting token from Zutand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;

    if (authStorage) {
        try {
            const parsedStorage = JSON.parse(authStorage);
            token = parsedStorage.state?.token;
        } catch (e) {
            console.error("Error parsing auth-storage", e);
        }
    }

    // 2. Fallback: try getting token explicitly (e.g. set during login flow before store update)
    if (!token) {
        token = localStorage.getItem('token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// Interceptor para manejar respuestas (ej. 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            // 1. Limpiar storage
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('token');
            // 2. Redirigir al login
            // Usamos window.location para forzar una recarga y limpiar estado en memoria si es necesario
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
