import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import VerifyCodePage from '@/features/auth/pages/VerifyCodePage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import MainLayout from '@/layouts/MainLayout';
import CreateUser from '@/pages/users/CreateUser';
import UserList from '@/pages/users/UserList';
import AirWaybillList from '@/pages/air-waybills/AirWaybillList';
import UploadAirWaybill from '@/pages/air-waybills/UploadAirWaybill';
import HomePage from '@/pages/home/HomePage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-code" element={<VerifyCodePage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />

                    <Route path="/users/create" element={<CreateUser />} />
                    <Route path="/users/edit/:id" element={<CreateUser />} />
                    <Route path="/users" element={<UserList />} />

                    <Route path="/air-waybills" element={<AirWaybillList viewCode="VC001" pageTitle="Gestión de Guías Aéreas" />} />
                    <Route path="/air-waybills/rectify" element={<AirWaybillList viewCode="VC002" pageTitle="Subsanación de Guías" />} />
                    <Route path="/air-waybills/upload" element={<UploadAirWaybill />} />
                </Route>
            </Route>

        </Routes>
    );
};

export default AppRoutes;
