import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <main className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
          Support Ticket Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name}</h1>
        <p className="mt-4 text-slate-300">
          Signed in as <span className="font-mono text-emerald-400">{user?.email}</span> (
          {user?.role})
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Log out
          </button>
          <Link
            to="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Login page
          </Link>
        </div>
      </main>
    </div>
  );
}
