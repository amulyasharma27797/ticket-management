import { useState, DragEvent } from "react";

import type { Ticket, TicketStatus } from "../../api/ticketTypes";
import { KANBAN_COLUMNS, TICKET_DRAG_TYPE } from "../../utils/kanbanColumns";
import { canTransitionStatus } from "../../utils/ticketTransitions";
import TicketCard from "./TicketCard";

type KanbanBoardProps = {
  tickets: Ticket[];
  canDrag?: boolean;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  updatingTicketId?: string | null;
};

export default function KanbanBoard({
  tickets,
  canDrag = false,
  onStatusChange,
  updatingTicketId = null,
}: KanbanBoardProps) {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const draggedTicket = draggedTicketId
    ? tickets.find((ticket) => ticket.id === draggedTicketId)
    : null;

  function isValidDropTarget(columnStatus: TicketStatus): boolean {
    if (!draggedTicket) return false;
    return canTransitionStatus(draggedTicket.status, columnStatus);
  }

  function handleDragOver(event: DragEvent<HTMLElement>, columnStatus: TicketStatus) {
    if (!canDrag || !isValidDropTarget(columnStatus)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>, columnId: string, status: TicketStatus) {
    event.preventDefault();
    setDragOverColumnId(null);
    setDraggedTicketId(null);
    if (!canDrag || !onStatusChange) return;

    const ticketId = event.dataTransfer.getData(TICKET_DRAG_TYPE);
    if (!ticketId) return;

    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket || !canTransitionStatus(ticket.status, status)) return;

    onStatusChange(ticketId, status);
  }

  return (
    <div className="flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-2">
      {KANBAN_COLUMNS.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.status);
        const isValidTarget = isValidDropTarget(column.status);
        const isDropTarget = dragOverColumnId === column.id && isValidTarget;

        return (
          <section
            key={column.id}
            onDragOver={(event) => handleDragOver(event, column.status)}
            onDragEnter={() => {
              if (canDrag && isValidDropTarget(column.status)) {
                setDragOverColumnId(column.id);
              }
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node)) return;
              setDragOverColumnId((current) => (current === column.id ? null : current));
            }}
            onDrop={(event) => handleDrop(event, column.id, column.status)}
            className={`flex h-full min-h-0 w-72 shrink-0 flex-col rounded-2xl p-3 transition ${
              isDropTarget
                ? "bg-sky-100/90 ring-2 ring-sky-400 ring-offset-2"
                : draggedTicket && !isValidTarget
                  ? "bg-slate-200/40 opacity-70"
                  : "bg-slate-200/70"
            }`}
          >
            <header
              className={`mb-3 shrink-0 rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white ${column.accent}`}
            >
              {column.title}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {columnTickets.length}
              </span>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {columnTickets.length === 0 ? (
                <div
                  className={`rounded-xl border border-dashed px-4 py-8 text-center text-sm ${
                    isDropTarget
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-slate-300 bg-white/50 text-slate-500"
                  }`}
                >
                  {isDropTarget ? "Drop ticket here" : "No tickets in this column"}
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    canDrag={canDrag}
                    statusUpdating={updatingTicketId === ticket.id}
                    onDragStartTicket={setDraggedTicketId}
                    onDragEndTicket={() => {
                      setDraggedTicketId(null);
                      setDragOverColumnId(null);
                    }}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
