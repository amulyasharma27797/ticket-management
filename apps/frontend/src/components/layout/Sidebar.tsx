import { Link, useLocation } from "react-router-dom";

import { LogoMark } from "../ui/Logo";
import { DashboardIcon } from "../../utils/sidebarIcons";
import { isNavItemActive, SIDEBAR_NAV_ITEMS } from "../../utils/sidebarNav";

export default function Sidebar() {
  const location = useLocation();
  const onDashboard = location.pathname === "/";

  return (
    <aside className="sidebar-rail hidden w-[4.5rem] flex-col items-center gap-2 py-5 text-slate-400 lg:flex">
      <Link to="/" title="TicketFlow home" className="mb-3 transition hover:opacity-90">
        <LogoMark size="lg" />
      </Link>
      <Link
        to="/"
        title="Dashboard"
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
          onDashboard ? "nav-pill-active" : "hover:bg-slate-800 hover:text-white"
        }`}
      >
        <DashboardIcon />
      </Link>
      <div className="my-1 h-px w-8 bg-slate-800" />
      {SIDEBAR_NAV_ITEMS.map((item) =>
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
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
              isNavItemActive(location.pathname, item)
                ? "nav-pill-active"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
          </Link>
        ),
      )}
    </aside>
  );
}
