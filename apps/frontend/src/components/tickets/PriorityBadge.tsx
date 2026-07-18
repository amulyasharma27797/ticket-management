import type { TicketPriority } from "../../api/ticketTypes";

const STYLES: Record<TicketPriority, string> = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-sky-100 text-sky-800",
  high: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800",
};

type PriorityBadgeProps = {
  priority: TicketPriority;
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
