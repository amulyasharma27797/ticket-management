import type { TicketStatus } from "../api/ticketTypes";

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["resolved", "cancelled"],
  resolved: ["closed", "cancelled"],
  closed: [],
  cancelled: [],
};

export function getAllowedTransitions(current: TicketStatus): TicketStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function canTransitionStatus(current: TicketStatus, next: TicketStatus): boolean {
  if (current === next) return true;
  return getAllowedTransitions(current).includes(next);
}

export function getStatusSelectOptions(current: TicketStatus): TicketStatus[] {
  const allowed = getAllowedTransitions(current);
  if (allowed.length === 0) {
    return [current];
  }
  return [current, ...allowed];
}
