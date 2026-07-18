import { Link, useLocation } from "react-router-dom";

import { Logo } from "../ui/Logo";
import { isNavItemActive, SIDEBAR_NAV_ITEMS } from "../../utils/sidebarNav";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const location = useLocation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close navigation menu"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-72 max-w-[85vw] animate-fade-up flex-col border-r border-slate-800/80 bg-slate-950/95 px-4 py-5 text-slate-100 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="md" textTone="light" href="/" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              location.pathname === "/"
                ? "nav-pill-active"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">⌂</span>
            Dashboard
          </Link>
          {SIDEBAR_NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isNavItemActive(location.pathname, item)
                    ? "nav-pill-active"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </aside>
    </div>
  );
}
