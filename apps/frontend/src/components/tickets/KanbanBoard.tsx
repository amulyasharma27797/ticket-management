import { useEffect, useRef, useState, type DragEvent } from "react";

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

const SUCCESS_FLASH_MS = 700;

function columnStateClass({
  isDragging,
  isValidTarget,
  isDropTarget,
  isSuccessFlash,
}: {
  isDragging: boolean;
  isValidTarget: boolean;
  isDropTarget: boolean;
  isSuccessFlash: boolean;
}): string {
  if (isSuccessFlash) return "kanban-column-success";
  if (isDropTarget) return "kanban-column-drop-target";
  if (isDragging && isValidTarget) return "kanban-column-available";
  if (isDragging && !isValidTarget) return "kanban-column-invalid";
  return "bg-slate-200/50 dark:bg-slate-800/60";
}

export default function KanbanBoard({
  tickets,
  canDrag = false,
  onStatusChange,
  updatingTicketId = null,
}: KanbanBoardProps) {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [successColumnId, setSuccessColumnId] = useState<string | null>(null);
  const draggedTicketIdRef = useRef<string | null>(null);

  const isDragging = Boolean(draggedTicketId);

  function getActiveDraggedTicket(): Ticket | null {
    const id = draggedTicketIdRef.current ?? draggedTicketId;
    if (!id) return null;
    return tickets.find((ticket) => ticket.id === id) ?? null;
  }

  function handleDragStartTicket(ticketId: string) {
    draggedTicketIdRef.current = ticketId;
    // Defer visual state so the native drag is not interrupted by a layout collapse.
    window.setTimeout(() => setDraggedTicketId(ticketId), 0);
  }

  function handleDragEndTicket() {
    draggedTicketIdRef.current = null;
    setDraggedTicketId(null);
    setDragOverColumnId(null);
  }

  useEffect(() => {
    if (!successColumnId) return;
    const timer = window.setTimeout(() => setSuccessColumnId(null), SUCCESS_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [successColumnId]);

  function isValidDropTarget(columnStatus: TicketStatus): boolean {
    const activeDraggedTicket = getActiveDraggedTicket();
    if (!activeDraggedTicket) return false;
    return canTransitionStatus(activeDraggedTicket.status, columnStatus);
  }

  function handleDragOver(
    event: DragEvent<HTMLElement>,
    columnStatus: TicketStatus,
    columnId: string,
  ) {
    if (!canDrag || !isValidDropTarget(columnStatus)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDragOverColumnId(columnId);
  }

  function handleDrop(event: DragEvent<HTMLElement>, columnId: string, status: TicketStatus) {
    event.preventDefault();
    event.stopPropagation();
    setDragOverColumnId(null);

    if (!canDrag || !onStatusChange) return;

    const ticketId =
      event.dataTransfer.getData(TICKET_DRAG_TYPE) || event.dataTransfer.getData("text/plain");
    if (!ticketId) return;

    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket || !canTransitionStatus(ticket.status, status)) return;

    draggedTicketIdRef.current = null;
    setDraggedTicketId(null);
    setSuccessColumnId(columnId);
    onStatusChange(ticketId, status);
  }

  return (
    <div
      className={`app-scrollbar flex h-full min-h-0 w-full gap-3 overflow-x-auto overflow-y-hidden pb-1 xl:gap-4 xl:overflow-x-hidden ${
        isDragging ? "kanban-board-dragging" : ""
      }`}
    >
      {KANBAN_COLUMNS.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.status);
        const isValidTarget = isValidDropTarget(column.status);
        const isDropTarget = dragOverColumnId === column.id && isValidTarget;
        const isSuccessFlash = successColumnId === column.id;

        return (
          <section
            key={column.id}
            onDragOver={(event) => handleDragOver(event, column.status, column.id)}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node)) return;
              setDragOverColumnId((current) => (current === column.id ? null : current));
            }}
            onDrop={(event) => handleDrop(event, column.id, column.status)}
            className={`kanban-column relative overflow-hidden ${columnStateClass({
              isDragging,
              isValidTarget,
              isDropTarget,
              isSuccessFlash,
            })}`}
          >
            {isDropTarget ? <div className="kanban-drop-shimmer pointer-events-none absolute inset-0" aria-hidden /> : null}

            <header className="kanban-column-header relative z-[1] mb-3 flex shrink-0 items-center gap-2 rounded-xl bg-white/60 px-3 py-2.5 backdrop-blur-sm transition dark:bg-slate-900/60">
              <span className={`h-2.5 w-2.5 rounded-full ${column.accent} ${isDropTarget ? "animate-pulse" : ""}`} />
              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {column.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                  isDropTarget
                    ? "bg-sky-500 text-white shadow-glow"
                    : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {columnTickets.length}
              </span>
            </header>

            <div
              className={`relative z-[1] flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 ${
                isDragging ? "pointer-events-none" : ""
              }`}
            >
              {columnTickets.length === 0 ? (
                <div
                  className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm transition ${
                    isDropTarget
                      ? "border-sky-400 bg-sky-50/80 text-sky-700 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300"
                      : isDragging && isValidTarget
                        ? "border-sky-300/60 bg-sky-50/40 text-sky-600 dark:border-sky-600/40 dark:bg-sky-950/20 dark:text-sky-400"
                        : "border-slate-300/60 bg-white/40 text-slate-400 dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-500"
                  }`}
                >
                  {isDropTarget ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="kanban-drop-indicator mb-2 h-8 w-8 text-sky-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                      <span className="font-medium">Release to drop</span>
                    </>
                  ) : isDragging && isValidTarget ? (
                    <span>Drop ticket here</span>
                  ) : (
                    <span>No tickets</span>
                  )}
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div key={ticket.id} className="relative">
                    {draggedTicketId === ticket.id ? (
                      <div className="ticket-card-placeholder pointer-events-none" aria-hidden="true" />
                    ) : null}
                    <div
                      className={
                        draggedTicketId === ticket.id
                          ? "pointer-events-none relative opacity-40"
                          : "relative"
                      }
                    >
                      <TicketCard
                        ticket={ticket}
                        canDrag={canDrag}
                        statusUpdating={updatingTicketId === ticket.id}
                        onDragStartTicket={handleDragStartTicket}
                        onDragEndTicket={handleDragEndTicket}
                      />
                    </div>
                  </div>
                ))
              )}

              {isDropTarget && columnTickets.length > 0 ? (
                <div className="kanban-drop-indicator flex items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400/60 bg-sky-50/60 px-3 py-2 text-xs font-medium text-sky-700 dark:border-sky-500/50 dark:bg-sky-950/30 dark:text-sky-300">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 19V5M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Release to move here
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
