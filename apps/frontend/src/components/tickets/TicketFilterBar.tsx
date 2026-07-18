import type { TicketPriority, TicketStatus } from "../../api/ticketTypes";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from "../../api/ticketTypes";
import Select from "../ui/Select";

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
  onExport?: () => void;
  exporting?: boolean;
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
  onExport,
  exporting = false,
}: TicketFilterBarProps) {
  const hasFilters = Boolean(status || priority);

  const statusOptions = [
    { value: "" as const, label: "All statuses" },
    ...STATUS_OPTIONS.map((option) => ({
      value: option,
      label: TICKET_STATUS_LABELS[option],
    })),
  ];

  const priorityOptions = [
    { value: "" as const, label: "All priorities" },
    ...PRIORITY_OPTIONS.map((option) => ({
      value: option,
      label: TICKET_PRIORITY_LABELS[option],
    })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex w-full min-w-[12rem] flex-1 items-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:w-auto sm:flex-none">
          <span className="shrink-0 font-medium">Status</span>
          <Select
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="All statuses"
            className="min-w-0 flex-1 sm:min-w-[11rem] sm:flex-none"
          />
        </label>

        <label className="flex w-full min-w-[12rem] flex-1 items-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:w-auto sm:flex-none">
          <span className="shrink-0 font-medium">Priority</span>
          <Select
            value={priority}
            onChange={onPriorityChange}
            options={priorityOptions}
            placeholder="All priorities"
            className="min-w-0 flex-1 sm:min-w-[11rem] sm:flex-none"
          />
        </label>

        {hasFilters ? (
          <button type="button" onClick={onClear} className="btn-ghost py-2">
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 sm:ml-auto dark:text-slate-300">
        {onExport ? (
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="btn-ghost px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export my tickets"}
          </button>
        ) : null}
        <span className="font-medium">
          {total} ticket{total === 1 ? "" : "s"}
          {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
        </span>
        {totalPages > 1 ? (
          <>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="btn-ghost px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="btn-ghost px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
