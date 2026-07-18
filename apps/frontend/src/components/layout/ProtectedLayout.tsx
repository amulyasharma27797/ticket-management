import { Navigate } from "react-router-dom";

import { Logo } from "../ui/Logo";
import AppBackgroundGraphics from "../ui/AppBackgroundGraphics";
import AppLayout from "./AppLayout";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-gradient relative flex min-h-screen flex-col items-center justify-center gap-4">
        <AppBackgroundGraphics />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Logo size="lg" showText />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
