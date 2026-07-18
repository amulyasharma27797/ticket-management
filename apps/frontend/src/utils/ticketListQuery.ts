import type { TicketListParams } from "../api/ticketTypes";

export function buildTicketListQuery(params: TicketListParams = {}): string {
  const query = new URLSearchParams();

  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.pageSize) {
    query.set("pageSize", String(params.pageSize));
  }
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.priority) {
    query.set("priority", params.priority);
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}
