import { apiFetch, apiFetchEnvelope } from "./client";
import type { Ticket, TicketCreateInput, TicketPriority, TicketStatus } from "./ticketTypes";

export async function fetchTickets(page = 1, pageSize = 100): Promise<Ticket[]> {
  const { data } = await apiFetchEnvelope<Ticket[]>(`/tickets?page=${page}&pageSize=${pageSize}`);
  return data;
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
