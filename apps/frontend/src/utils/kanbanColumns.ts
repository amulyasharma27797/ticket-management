import type { TicketStatus } from "../api/ticketTypes";

export type KanbanColumn = {
  id: string;
  title: string;
  status: TicketStatus;
  accent: string;
};

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "open", title: "Open", status: "open", accent: "bg-slate-600" },
  { id: "progress", title: "In Progress", status: "in_progress", accent: "bg-sky-600" },
  { id: "pending", title: "Pending", status: "resolved", accent: "bg-indigo-600" },
  { id: "completed", title: "Completed", status: "closed", accent: "bg-emerald-600" },
  { id: "cancelled", title: "Cancelled", status: "cancelled", accent: "bg-rose-600" },
];

export const TICKET_DRAG_TYPE = "application/x-ticket-id";
