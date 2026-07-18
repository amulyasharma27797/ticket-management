import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTickets, updateTicketStatus } from "../api/tickets";
import type { Ticket, TicketPriority, TicketStatus } from "../api/ticketTypes";
import KanbanBoard from "../components/tickets/KanbanBoard";
import TicketFilterBar from "../components/tickets/TicketFilterBar";
import { useLayoutSearch } from "../hooks/useLayoutSearch";
import { useAuth } from "../hooks/useAuth";
import { parseApiError } from "../utils/authErrors";
import { canDragTicketOnBoard } from "../utils/ticketPermissions";
import { canTransitionStatus } from "../utils/ticketTransitions";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

export default function DashboardPage() {
  const { user } = useAuth();
  const { search } = useLayoutSearch();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const canDrag = canDragTicketOnBoard(user);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

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
      .catch(() => setError("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page, priorityFilter, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const stats = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
      pending: tickets.filter((ticket) => ticket.status === "resolved").length,
      completed: tickets.filter((ticket) => ticket.status === "closed").length,
      cancelled: tickets.filter((ticket) => ticket.status === "cancelled").length,
    }),
    [tickets],
  );

  const statItems = [
    { label: "Open", value: stats.open },
    { label: "In progress", value: stats.inProgress },
    { label: "Pending", value: stats.pending },
    { label: "Completed", value: stats.completed },
    { label: "Cancelled", value: stats.cancelled },
  ];

  function handleClearFilters() {
    setStatusFilter("");
    setPriorityFilter("");
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
      if (statusFilter && updated.status !== statusFilter) {
        loadTickets();
      }
    } catch (err) {
      setTickets((current) =>
        current.map((ticket) => (ticket.id === ticketId ? previous : ticket)),
      );
      setStatusError(parseApiError(err).message ?? "Failed to update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  return (
    <div className="page-gradient flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-b border-slate-200/80 bg-white/60 px-5 py-5 backdrop-blur-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Ticket board</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="mt-3 text-sm text-slate-500">
          Track support requests across open, in-progress, pending, completed, and cancelled queues.
          {canDrag
            ? " Drag a ticket card to another column to change its status."
            : ""}
        </p>

        <div className="mt-4 flex w-full items-stretch gap-3">
          <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="min-w-[7rem] flex-1 rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs uppercase text-slate-400">{item.label}</p>
                <p className="text-xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <Link
            to="/tickets/new"
            className="inline-flex shrink-0 items-center self-stretch rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
          >
            + Create ticket
          </Link>
        </div>

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
        />

        {statusError ? <p className="mt-4 text-sm text-red-500">{statusError}</p> : null}
      </section>

      <section className="min-h-0 flex-1 overflow-hidden p-5">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-white/70 text-slate-500 shadow-sm">
            Loading tickets...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-white/70 text-slate-500 shadow-sm">
            No tickets match your search or filters.
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
  );
}
