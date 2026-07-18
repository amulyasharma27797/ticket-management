import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

type HealthResponse = {
  success: boolean;
  data: { status: string };
};

export default function App() {
  const [health, setHealth] = useState<string>("checking...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HealthResponse>;
      })
      .then((body) => setHealth(body.data.status))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <main className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
          Support Ticket Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Phase 0 Scaffold</h1>
        <p className="mt-4 text-slate-300">
          Frontend is running. Backend health:{" "}
          <span className="font-mono text-emerald-400">
            {error ? `error (${error})` : health}
          </span>
        </p>
      </main>
    </div>
  );
}
