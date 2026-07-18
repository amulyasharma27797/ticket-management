import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { API_DOCS_URL } from "../../api/client";

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  external?: boolean;
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16v12H4z" />
      <path d="M4 10h4l2 3h4l2-3h4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12V4h8l8 8-8 8-8-8z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5M14 19c0-1.8 1.6-3.2 3.5-3.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="10" cy="10" r="2" />
      <path d="M6 18c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h7l4 4v12H7z" />
      <path d="M14 4v4h4" />
      <path d="M10 12h6M10 16h6" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inbox", to: "/", icon: <InboxIcon /> },
  { label: "Analytics", to: "/", icon: <ChartIcon /> },
  { label: "Tickets", to: "/", icon: <TagIcon /> },
  { label: "Team", to: "/", icon: <UsersIcon /> },
  { label: "Settings", to: "/", icon: <SettingsIcon /> },
  { label: "Contacts", to: "/", icon: <ContactsIcon /> },
  { label: "Docs", to: API_DOCS_URL, icon: <DocsIcon />, external: true },
];

export default function Sidebar() {
  const location = useLocation();
  const onDashboard = location.pathname === "/";

  return (
    <aside className="flex w-16 flex-col items-center gap-2 border-r border-slate-800 bg-slate-950 py-5 text-slate-300">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
        TM
      </div>
      <Link
        to="/"
        title="Dashboard"
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
          onDashboard
            ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
            : "hover:bg-slate-800 hover:text-white"
        }`}
      >
        <DashboardIcon />
      </Link>
      <div className="my-1 h-px w-8 bg-slate-800" />
      {NAV_ITEMS.map((item) =>
        item.external ? (
          <a
            key={item.label}
            href={item.to}
            target="_blank"
            rel="noopener noreferrer"
            title={item.label}
            className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-slate-800 hover:text-white"
          >
            {item.icon}
          </a>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            title={item.label}
            className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-slate-800 hover:text-white"
          >
            {item.icon}
          </Link>
        ),
      )}
    </aside>
  );
}
