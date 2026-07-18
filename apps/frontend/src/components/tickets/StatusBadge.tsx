import { TICKET_STATUS_LABELS, type TicketStatus } from "../../api/ticketTypes";

const STYLES: Record<TicketStatus, string> = {
  open: "bg-slate-100 text-slate-700",
  in_progress: "bg-sky-100 text-sky-800",
  resolved: "bg-indigo-100 text-indigo-800",
  closed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

type StatusBadgeProps = {
  status: TicketStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${STYLES[status]}`}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
