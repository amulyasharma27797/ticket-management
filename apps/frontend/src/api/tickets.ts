import { apiFetch, apiFetchEnvelope } from "./client";
import type {
  Ticket,
  TicketCreateInput,
  TicketListMeta,
  TicketListParams,
  TicketPriority,
  TicketStats,
  TicketStatus,
} from "./ticketTypes";
import { buildTicketListQuery } from "../utils/ticketListQuery";

export async function fetchTickets(
  params: TicketListParams = {},
): Promise<{ tickets: Ticket[]; meta: TicketListMeta }> {
  const { data, meta } = await apiFetchEnvelope<Ticket[]>(`/tickets${buildTicketListQuery(params)}`);
  return {
    tickets: data,
    meta: meta as TicketListMeta,
  };
}

export async function fetchTicketStats(): Promise<TicketStats> {
  return apiFetch<TicketStats>("/tickets/stats");
}

export async function createTicket(payload: TicketCreateInput): Promise<Ticket> {
  return apiFetch<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchTicket(ticketId: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}`);
}

export async function updateTicketTitle(ticketId: string, title: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/title`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function updateTicketDescription(
  ticketId: string,
  description: string,
): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/description`, {
    method: "PATCH",
    body: JSON.stringify({ description }),
  });
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/priority`, {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function assignTicket(
  ticketId: string,
  assignedToId: string | null,
): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${ticketId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedToId }),
  });
}
