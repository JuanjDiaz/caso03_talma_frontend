import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import VerifyCodePage from '@/features/auth/pages/VerifyCodePage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import MainLayout from '@/layouts/MainLayout';
import CreateUser from '@/pages/users/CreateUser';
import UserList from '@/pages/users/UserList';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-code" element={<VerifyCodePage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<MainLayout />}>
                <Route path="/users/create" element={<CreateUser />} />
                <Route path="/users/edit/:id" element={<CreateUser />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/" element={<Navigate to="/users" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
