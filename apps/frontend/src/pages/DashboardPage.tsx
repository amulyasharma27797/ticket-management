import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { TicketStats } from "../api/ticketTypes";
import type { Ticket, TicketPriority, TicketStatus } from "../api/ticketTypes";
import { downloadMyTicketsCsv, fetchTicketStats, fetchTickets, updateTicketStatus } from "../api/tickets";
import KanbanBoard from "../components/tickets/KanbanBoard";
import TicketFilterBar from "../components/tickets/TicketFilterBar";
import PageShell from "../components/layout/PageShell";
import RightSidebar from "../components/layout/RightSidebar";
import ErrorAlert from "../components/ui/ErrorAlert";
import { useLayoutSearch } from "../hooks/useLayoutSearch";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/authErrors";
import { canDragTicketOnBoard } from "../utils/ticketPermissions";
import { canTransitionStatus } from "../utils/ticketTransitions";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_STATS: TicketStats = {
  total: 0,
  byStatus: {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    cancelled: 0,
  },
  byPriority: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
};

const STAT_CONFIG = [
  { label: "Open", valueKey: "open" as const, accent: "bg-slate-500", icon: "○" },
  { label: "In progress", valueKey: "in_progress" as const, accent: "bg-sky-500", icon: "◐" },
  { label: "Pending", valueKey: "resolved" as const, accent: "bg-indigo-500", icon: "◑" },
  { label: "Completed", valueKey: "closed" as const, accent: "bg-emerald-500", icon: "●" },
  { label: "Cancelled", valueKey: "cancelled" as const, accent: "bg-rose-500", icon: "✕" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { search } = useLayoutSearch();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const canDrag = canDragTicketOnBoard(user);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetchTicketStats()
      .then(setStats)
      .catch((err) => {
        setStats(EMPTY_STATS);
        setError(getErrorMessage(err, "Failed to load dashboard stats."));
      })
      .finally(() => setStatsLoading(false));
  }, []);

  const loadTickets = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchTickets({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    })
      .then(({ tickets: nextTickets, meta }) => {
        setTickets(nextTickets);
        setTotal(meta.total);
        setTotalPages(meta.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, "Failed to load tickets.")))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page, priorityFilter, statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  function handleClearFilters() {
    setStatusFilter("");
    setPriorityFilter("");
  }

  async function handleExportCsv() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadMyTicketsCsv();
      showToast("Tickets exported successfully.");
    } catch (err) {
      setExportError(getErrorMessage(err, "Failed to export tickets."));
      showToast(getErrorMessage(err, "Failed to export tickets."), "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleStatusChange(ticketId: string, status: TicketStatus) {
    const previous = tickets.find((ticket) => ticket.id === ticketId);
    if (!previous || previous.status === status) return;
    if (!canTransitionStatus(previous.status, status)) {
      setStatusError(`Cannot move ticket from ${previous.status} to ${status}.`);
      return;
    }

    setStatusError(null);
    setUpdatingTicketId(ticketId);
    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
    );

    try {
      const updated = await updateTicketStatus(ticketId, status);
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? updated : ticket)));
      loadStats();
      if (statusFilter && updated.status !== statusFilter) {
        loadTickets();
      }
    } catch (err) {
      setTickets((current) =>
        current.map((ticket) => (ticket.id === ticketId ? previous : ticket)),
      );
      setStatusError(getErrorMessage(err, "Failed to update ticket status."));
      showToast(getErrorMessage(err, "Failed to update ticket status."), "error");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  return (
    <PageShell fill>
      <section className="glass-panel relative z-30 shrink-0 border-b px-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Ticket board</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Track support requests across open, in-progress, pending, completed, and cancelled queues.
              {canDrag ? " Drag a ticket card to another column to change its status." : ""}
            </p>
          </div>
          <Link to="/tickets/new" className="btn-primary shrink-0 self-start">
            + Create ticket
          </Link>
        </div>

        <div className="app-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
          {STAT_CONFIG.map((item) => (
            <div key={item.label} className="stat-card min-w-[8.5rem] flex-1">
              <div className={`stat-card-accent ${item.accent}`} />
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                <span className="text-sm text-slate-300 dark:text-slate-600" aria-hidden="true">
                  {item.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {statsLoading ? (
                  <span className="inline-block h-7 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                ) : (
                  stats.byStatus[item.valueKey]
                )}
              </p>
            </div>
          ))}
        </div>

      </section>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <section className="glass-panel relative z-30 shrink-0 border-b px-4 py-3 sm:px-5">
            <TicketFilterBar
              status={statusFilter}
              priority={priorityFilter}
              page={page}
              totalPages={totalPages}
              total={total}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onClear={handleClearFilters}
              onPageChange={setPage}
              onExport={handleExportCsv}
              exporting={exporting}
            />

            {exportError ? <ErrorAlert className="mt-3" message={exportError} /> : null}

            {statusError ? <ErrorAlert className="mt-3" message={statusError} /> : null}
          </section>

          <section className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
            {loading ? (
              <div className="empty-state h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                  <span>Loading tickets...</span>
                </div>
              </div>
            ) : error ? (
              <div className="empty-state h-full">
                <ErrorAlert message={error} onRetry={loadTickets} />
              </div>
            ) : tickets.length === 0 ? (
              <div className="empty-state h-full">
                <div className="text-center">
                  <p className="text-base font-medium text-slate-600 dark:text-slate-300">No tickets found</p>
                  <p className="mt-1 text-sm">Try adjusting your search or filters, or create a new ticket.</p>
                  <Link to="/tickets/new" className="btn-primary mt-4 inline-flex">
                    + Create ticket
                  </Link>
                </div>
              </div>
            ) : (
              <KanbanBoard
                tickets={tickets}
                canDrag={canDrag}
                onStatusChange={handleStatusChange}
                updatingTicketId={updatingTicketId}
              />
            )}
          </section>
        </div>

        <RightSidebar />
      </div>
    </PageShell>
  );
}
