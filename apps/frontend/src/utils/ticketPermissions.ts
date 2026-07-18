import type { User } from "../api/types";

export function canDragTicketOnBoard(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "agent";
}

export function canChangeTicketStatusOnDetail(user: User | null): boolean {
  return user?.role === "admin";
}

/** @deprecated Use canDragTicketOnBoard */
export function canManageTicketStatus(user: User | null): boolean {
  return canDragTicketOnBoard(user);
}
