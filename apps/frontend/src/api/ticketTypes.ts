export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "cancelled";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Pending",
  closed: "Completed",
  cancelled: "Cancelled",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
];

export const PRIORITY_OPTIONS: TicketPriority[] = ["low", "medium", "high", "critical"];

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

export type TicketListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
};

export type TicketListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TicketStats = {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
};
