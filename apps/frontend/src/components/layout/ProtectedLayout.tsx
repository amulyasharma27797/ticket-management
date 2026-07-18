import { Navigate } from "react-router-dom";

import AppLayout from "./AppLayout";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-gradient flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
