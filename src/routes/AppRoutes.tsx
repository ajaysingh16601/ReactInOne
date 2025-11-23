import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import Dashboard from "../pages/Dashboard";
import AboutPage from "../pages/AboutPage";
import { ChatPage } from "../pages/ChatPage";
import ProtectedLayout from "../components/ProtectedLayout";
import { useAppSelector } from "../hooks";
import SettingsPage from "../pages/SettingsPage";

const AppRoutes = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch-all */}
            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />
        </Routes>
    );
};

export default AppRoutes;
