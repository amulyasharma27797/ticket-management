import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { userInitials } from "../../utils/userInitials";
import ThemeToggle from "./ThemeToggle";

type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onMenuClick: () => void;
};

export default function Header({ search, onSearchChange, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="header-glass flex items-center gap-4 px-5 py-3 text-white">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
        </svg>
      </button>

      <div className="relative min-w-0 flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="currentColor"
        >
          <path d="M10 2a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets by title or description..."
          className="w-full rounded-2xl border border-white/10 bg-white/10 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 outline-none backdrop-blur-sm transition focus:border-sky-500/50 focus:bg-white/15 focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Link to="/tickets/new" className="btn-primary hidden px-4 py-2 sm:inline-flex">
          + New ticket
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs capitalize text-slate-400">{user?.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white shadow-glow">
          {userInitials(user?.name)}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
