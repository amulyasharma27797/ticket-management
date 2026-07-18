import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedLayout from "../components/layout/ProtectedLayout";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import { ToastProvider } from "../context/ToastContext";
import CreateTicketPage from "../pages/CreateTicketPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TicketDetailPage from "../pages/TicketDetailPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ErrorBoundary>
              <Routes>
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tickets/new" element={<CreateTicketPage />} />
                  <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
