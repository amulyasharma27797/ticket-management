import type { TeamMember } from "../api/users";

const ROLE_LABELS: Record<TeamMember["role"], string> = {
  admin: "Admin",
  agent: "Agent",
  user: "User",
};

export function teamMemberRoleLabel(role: TeamMember["role"]): string {
  return ROLE_LABELS[role];
}

export function teamMemberTitle(member: TeamMember): string {
  if (member.isDefault) {
    return `${member.name} - Pre Seeded Team member`;
  }
  return member.name;
}

export function teamMemberAvatarClass(member: TeamMember): string {
  if (member.isDefault) {
    return "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 ring-amber-300/90 hover:ring-amber-400 dark:from-amber-950/70 dark:to-orange-950/50 dark:text-amber-100 dark:ring-amber-600/70 dark:hover:ring-amber-500/80";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200/80 hover:ring-sky-400/60 dark:bg-slate-800 dark:text-white dark:ring-slate-700/80 dark:hover:ring-sky-500/50";
}
