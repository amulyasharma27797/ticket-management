import { apiFetch, apiFetchEnvelope } from "./client";
import type { Comment, CommentCreateInput } from "./commentTypes";

export async function fetchComments(ticketId: string): Promise<Comment[]> {
  const { data } = await apiFetchEnvelope<Comment[]>(`/tickets/${ticketId}/comments`);
  return data;
}

export async function createComment(
  ticketId: string,
  payload: CommentCreateInput,
): Promise<Comment> {
  return apiFetch<Comment>(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
