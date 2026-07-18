export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "cancelled";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Pending",
  closed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
];

/** @deprecated Use STATUS_OPTIONS */
export const ADMIN_STATUS_OPTIONS = STATUS_OPTIONS;

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
};

export type TicketCreateInput = {
  title: string;
  description: string;
  priority?: TicketPriority;
};
