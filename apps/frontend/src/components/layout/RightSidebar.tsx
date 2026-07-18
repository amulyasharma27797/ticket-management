import { Link } from "react-router-dom";

const TEAM = ["AM", "JD", "SK", "RP", "LC"];

type RightSidebarProps = {
  className?: string;
};

export default function RightSidebar({ className = "" }: RightSidebarProps) {
  return (
    <aside
      className={`hidden w-[4.5rem] shrink-0 flex-col items-center border-l border-slate-200/80 bg-white/80 py-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 xl:flex ${className}`}
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Team
      </p>
      <div className="flex flex-1 flex-col items-center gap-3">
        {TEAM.map((initials, index) => (
          <div
            key={initials}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 ring-2 ring-slate-200/80 transition hover:ring-sky-400/60 dark:bg-slate-800 dark:text-white dark:ring-slate-700/80 dark:hover:ring-sky-500/50"
            style={{ opacity: 1 - index * 0.08 }}
            title={`Team member ${initials}`}
          >
            {initials}
          </div>
        ))}
      </div>
      <Link
        to="/tickets/new"
        className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-glow-lg"
        title="Create ticket"
      >
        +
      </Link>
    </aside>
  );
}
