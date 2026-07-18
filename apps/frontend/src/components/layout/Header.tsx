import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

function userInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Header({ search, onSearchChange }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center gap-4 border-b border-sky-700 bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3 text-white shadow-md">
      <button
        type="button"
        className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
        aria-label="Menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
        </svg>
      </button>

      <div className="relative min-w-0 flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="currentColor"
        >
          <path d="M10 2a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets by title or description..."
          className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-inner outline-none ring-sky-300 focus:ring-2"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/tickets/new"
          className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25 sm:inline-flex"
        >
          + New ticket
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-sky-100">{user?.role}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-700">
          {userInitials(user?.name)}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-white/30 px-3 py-2 text-xs font-medium hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
