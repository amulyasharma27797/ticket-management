import type { CSSProperties } from "react";

import type { TeamMember } from "../../api/users";
import Tooltip from "../ui/Tooltip";
import { userInitials } from "../../utils/userInitials";
import {
  teamMemberAvatarClass,
  teamMemberRoleLabel,
  teamMemberTitle,
} from "../../utils/teamMembers";

type TeamMemberAvatarProps = {
  member: TeamMember;
  style?: CSSProperties;
};

function TeamMemberTooltipContent({ member }: { member: TeamMember }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
          {member.name}
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {teamMemberRoleLabel(member.role)}
        </p>
      </div>
      {member.isDefault ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/70 dark:text-amber-100">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
          Pre-seeded team member
        </span>
      ) : null}
    </div>
  );
}

export default function TeamMemberAvatar({ member, style }: TeamMemberAvatarProps) {
  return (
    <Tooltip content={<TeamMemberTooltipContent member={member} />} label={teamMemberTitle(member)} side="left">
      <div
        className={`flex h-9 w-9 cursor-default items-center justify-center rounded-full text-[10px] font-semibold ring-2 transition ${teamMemberAvatarClass(member)}`}
        style={style}
      >
        {userInitials(member.name)}
      </div>
    </Tooltip>
  );
}
