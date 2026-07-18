import { useRef, useState, type DragEvent } from "react";
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

export default function TicketCard({
  ticket,
  canDrag = false,
  statusUpdating = false,
  onDragStartTicket,
  onDragEndTicket,
}: TicketCardProps) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const suppressClickRef = useRef(false);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData(TICKET_DRAG_TYPE, ticket.id);
    event.dataTransfer.effectAllowed = "move";
    suppressClickRef.current = false;
    setIsDragging(true);
    onDragStartTicket?.(ticket.id);
  }

  function handleDragEnd() {
    suppressClickRef.current = true;
    setIsDragging(false);
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
      className={`rounded-xl border bg-white shadow-sm transition ${
        canDrag && !statusUpdating ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${
        isDragging
          ? "scale-[0.98] border-sky-400 opacity-60 shadow-lg"
          : "border-slate-200 hover:border-sky-300 hover:shadow-md"
      } ${statusUpdating ? "pointer-events-none opacity-60" : ""}`}
    >
      <div className="block p-4 transition hover:-translate-y-0.5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.5L12 11 4 6.5V6h16ZM4 18V8.2l7.4 4.43a1 1 0 0 0 1.2 0L20 8.2V18H4Z" />
            </svg>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white"
            title="Assignee"
          >
            {initialsFromTitle(ticket.title)}
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{ticket.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {ticket.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <PriorityBadge priority={ticket.priority} />
          <span className="text-[11px] text-slate-400">{ticket.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
