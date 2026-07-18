import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTeamMembers, type TeamMember } from "../../api/users";
import TeamMemberAvatar from "../team/TeamMemberAvatar";
import Tooltip from "../ui/Tooltip";

type RightSidebarProps = {
  className?: string;
};

export default function RightSidebar({ className = "" }: RightSidebarProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers()
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside
      className={`relative z-40 hidden w-[4.5rem] shrink-0 flex-col items-center overflow-visible border-l border-slate-200/80 bg-white/80 py-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 xl:flex ${className}`}
    >
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Team
      </p>
      <div className="flex flex-1 flex-col items-center gap-3">
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        ) : teamMembers.length === 0 ? (
          <p className="px-2 text-center text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
            No team members
          </p>
        ) : (
          teamMembers.map((member, index) => (
            <TeamMemberAvatar
              key={member.id}
              member={member}
              style={{ opacity: 1 - index * 0.08 }}
            />
          ))
        )}
      </div>
      <Tooltip content={<p className="text-sm font-semibold text-slate-900 dark:text-white">Create ticket</p>} label="Create ticket" side="left">
        <Link
          to="/tickets/new"
          className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-glow-lg"
        >
          +
        </Link>
      </Tooltip>
    </aside>
  );
}
