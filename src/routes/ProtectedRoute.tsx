import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = () => {
    // Check both authentication flag and token presence
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);

    // If not authenticated or no token, redirect to login
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render child routes (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
