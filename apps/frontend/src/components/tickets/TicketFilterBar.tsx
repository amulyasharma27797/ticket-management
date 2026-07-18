import type { TicketPriority, TicketStatus } from "../../api/ticketTypes";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from "../../api/ticketTypes";

type TicketFilterBarProps = {
  status: TicketStatus | "";
  priority: TicketPriority | "";
  page: number;
  totalPages: number;
  total: number;
  onStatusChange: (value: TicketStatus | "") => void;
  onPriorityChange: (value: TicketPriority | "") => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
};

export default function TicketFilterBar({
  status,
  priority,
  page,
  totalPages,
  total,
  onStatusChange,
  onPriorityChange,
  onClear,
  onPageChange,
}: TicketFilterBarProps) {
  const hasFilters = Boolean(status || priority);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TicketStatus | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-sky-300 focus:ring-2"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {TICKET_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Priority</span>
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as TicketPriority | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-sky-300 focus:ring-2"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {TICKET_PRIORITY_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Clear filters
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
        <span>
          {total} ticket{total === 1 ? "" : "s"}
          {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
        </span>
        {totalPages > 1 ? (
          <>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
