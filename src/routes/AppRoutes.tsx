import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import VerifyCodePage from '@/features/auth/pages/VerifyCodePage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import MainLayout from '@/layouts/MainLayout';
import CreateUser from '@/features/users/pages/CreateUser';
import UserList from '@/features/users/pages/UserList';
import AirWaybillList from '@/features/air-waybills/pages/AirWaybillList';
import UploadAirWaybill from '@/features/air-waybills/pages/UploadAirWaybill';
import AirWaybillDetailPage from '@/features/air-waybills/pages/AirWaybillDetailPage';
import HomePage from '@/features/home/pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import AirWaybillRectifyList from '@/features/air-waybills/pages/AirWaybillRectifyList';
import AirWaybillRectifyPage from '@/features/air-waybills/pages/AirWaybillRectifyPage';
import DocumentsPage from '@/features/documents/pages/DocumentsPage';

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
                    <Route path="/documents" element={<DocumentsPage />} />

                    <Route path="/users/create" element={<CreateUser />} />
                    <Route path="/users/edit/:id" element={<CreateUser />} />
                    <Route path="/users" element={<UserList />} />

                    <Route path="/air-waybills" element={<AirWaybillList />} />
                    <Route path="/air-waybills/rectify" element={<AirWaybillRectifyList />} />
                    <Route path="/air-waybills/rectify/edit" element={<AirWaybillRectifyPage />} />
                    <Route path="/air-waybills/view/:id" element={<AirWaybillDetailPage />} />
                    <Route path="/air-waybills/upload" element={<UploadAirWaybill />} />
                </Route>
            </Route>

        </Routes>
    );
};

export default AppRoutes;
