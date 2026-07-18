import { Link } from "react-router-dom";

const TEAM = ["AM", "JD", "SK", "RP", "LC"];

export default function RightSidebar() {
  return (
    <aside className="hidden w-16 flex-col items-center border-l border-slate-800 bg-slate-950 py-5 text-slate-300 xl:flex">
      <p className="mb-4 rotate-180 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 [writing-mode:vertical-rl]">
        Team
      </p>
      <div className="flex flex-1 flex-col items-center gap-3">
        {TEAM.map((initials) => (
          <div
            key={initials}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white ring-2 ring-slate-700"
            title={`Team member ${initials}`}
          >
            {initials}
          </div>
        ))}
      </div>
      <Link
        to="/tickets/new"
        className="mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-xl font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
        title="Create ticket"
      >
        +
      </Link>
    </aside>
  );
}
