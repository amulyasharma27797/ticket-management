import { useRef, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import type { Ticket } from "../../api/ticketTypes";
import { TICKET_DRAG_TYPE } from "../../utils/kanbanColumns";
import PriorityBadge from "./PriorityBadge";

type TicketCardProps = {
  ticket: Ticket;
  canDrag?: boolean;
  statusUpdating?: boolean;
  onDragStartTicket?: (ticketId: string) => void;
  onDragEndTicket?: () => void;
};

function initialsFromTitle(title: string): string {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createDragGhost(source: HTMLElement): HTMLElement {
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.style.position = "fixed";
  ghost.style.top = "-9999px";
  ghost.style.left = "-9999px";
  ghost.style.width = `${rect.width}px`;
  ghost.style.pointerEvents = "none";
  ghost.classList.add("ticket-card-drag-ghost");
  document.body.appendChild(ghost);
  return ghost;
}

export default function TicketCard({
  ticket,
  canDrag = false,
  statusUpdating = false,
  onDragStartTicket,
  onDragEndTicket,
}: TicketCardProps) {
  const navigate = useNavigate();
  const suppressClickRef = useRef(false);
  const dragGhostRef = useRef<HTMLElement | null>(null);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    const source = event.currentTarget;
    event.dataTransfer.setData(TICKET_DRAG_TYPE, ticket.id);
    event.dataTransfer.setData("text/plain", ticket.id);
    event.dataTransfer.effectAllowed = "move";
    suppressClickRef.current = false;
    onDragStartTicket?.(ticket.id);

    const ghost = createDragGhost(source);
    dragGhostRef.current = ghost;
    event.dataTransfer.setDragImage(ghost, source.offsetWidth / 2, 28);
  }

  function handleDragEnd() {
    suppressClickRef.current = true;
    if (dragGhostRef.current) {
      dragGhostRef.current.remove();
      dragGhostRef.current = null;
    }
    onDragEndTicket?.();
  }

  function handleOpenTicket() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    navigate(`/tickets/${ticket.id}`);
  }

  return (
    <article
      draggable={canDrag && !statusUpdating}
      onDragStart={canDrag ? handleDragStart : undefined}
      onDragEnd={canDrag ? handleDragEnd : undefined}
      onClick={handleOpenTicket}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenTicket();
        }
      }}
      role="button"
      tabIndex={0}
      className={`ticket-card group relative ${
        canDrag && !statusUpdating ? "ticket-card-draggable cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${statusUpdating ? "pointer-events-none animate-pulse opacity-70" : ""}`}
    >
      {canDrag && !statusUpdating ? (
        <div
          className="ticket-drag-handle absolute right-2 top-2 z-10 flex flex-col gap-0.5 rounded-md bg-white/80 p-1 opacity-0 shadow-sm transition-opacity dark:bg-slate-800/80"
          aria-hidden="true"
        >
          <span className="h-0.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-500" />
          <span className="h-0.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-500" />
          <span className="h-0.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-500" />
        </div>
      ) : null}

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-600 dark:from-sky-950 dark:to-indigo-950 dark:text-sky-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.5L12 11 4 6.5V6h16ZM4 18V8.2l7.4 4.43a1 1 0 0 0 1.2 0L20 8.2V18H4Z" />
            </svg>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white"
            title="Assignee"
          >
            {initialsFromTitle(ticket.title)}
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {ticket.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {ticket.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <PriorityBadge priority={ticket.priority} />
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {ticket.commentCount} {ticket.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>

      {statusUpdating ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          <div className="kanban-drop-shimmer absolute inset-0" />
        </div>
      ) : null}
    </article>
  );
}
