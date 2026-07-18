import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "../api/ticketTypes";
import type { Comment } from "../api/commentTypes";
import { createComment, fetchComments } from "../api/comments";
import {
  fetchTicket,
  updateTicketDescription,
  updateTicketPriority,
  updateTicketStatus,
  updateTicketTitle,
} from "../api/tickets";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import ErrorAlert, { FieldErrorsNotice } from "../components/ui/ErrorAlert";
import PageShell from "../components/layout/PageShell";
import CommentList from "../components/tickets/CommentList";
import PriorityBadge from "../components/tickets/PriorityBadge";
import StatusBadge from "../components/tickets/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, inputClassName, parseApiError } from "../utils/authErrors";
import { canChangeTicketStatusOnDetail } from "../utils/ticketPermissions";
import { getStatusSelectOptions } from "../utils/ticketTransitions";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "critical"];
const SUCCESS_REDIRECT_MS = 1500;

function detailInputClassName(hasError: boolean): string {
  return `${inputClassName(hasError)} bg-slate-50 dark:bg-slate-900/80`;
}

export default function TicketDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { ticketId } = useParams<{ ticketId: string }>();
  const canChangeStatus = canChangeTicketStatusOnDetail(user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [status, setStatus] = useState<TicketStatus>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    fetchTicket(ticketId)
      .then((data) => {
        setTicket(data);
        setTitle(data.title);
        setDescription(data.description);
        setPriority(data.priority);
        setStatus(data.status);
      })
      .catch((err) => setError(getErrorMessage(err, "Failed to load ticket")))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;
    setCommentsLoading(true);
    fetchComments(ticketId)
      .then(setComments)
      .catch((err) => setCommentsError(getErrorMessage(err, "Failed to load comments")))
      .finally(() => setCommentsLoading(false));
  }, [ticketId]);

  useEffect(() => {
    if (!showSuccessModal) return;

    const timer = window.setTimeout(() => {
      navigate("/");
    }, SUCCESS_REDIRECT_MS);

    return () => window.clearTimeout(timer);
  }, [showSuccessModal, navigate]);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticketId || !ticket) return;

    const statusChanged = canChangeStatus && status !== ticket.status;
    const hasContentChanges =
      title !== ticket.title ||
      description !== ticket.description ||
      priority !== ticket.priority;
    const hasChanges = statusChanged || hasContentChanges;

    if (!hasChanges) {
      setError("No changes to save.");
      setFieldErrors({});
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      let updated = ticket;
      if (statusChanged) {
        updated = await updateTicketStatus(ticketId, status);
      }
      if (hasContentChanges) {
        if (title !== ticket.title) {
          updated = await updateTicketTitle(ticketId, title);
        }
        if (description !== ticket.description) {
          updated = await updateTicketDescription(ticketId, description);
        }
        if (priority !== ticket.priority) {
          updated = await updateTicketPriority(ticketId, priority);
        }
      }
      setTicket(updated);
      setShowSuccessModal(true);
      showToast("Ticket updated successfully.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setError(getErrorMessage(err, "Failed to update ticket. Please review the form and try again."));
      showToast(getErrorMessage(err, "Failed to update ticket."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(message: string) {
    if (!ticketId || !ticket) return;

    setCommentSubmitting(true);
    try {
      const created = await createComment(ticketId, { message });
      setComments((current) => [...current, created]);
      setTicket({ ...ticket, commentCount: ticket.commentCount + 1 });
      showToast("Comment posted.");
    } catch (err) {
      const messageText = getErrorMessage(err, "Failed to add comment.");
      showToast(messageText, "error");
      throw err;
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell className="flex min-h-full flex-col items-center justify-center gap-4 p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading ticket...</p>
      </PageShell>
    );
  }

  if (error && !ticket) {
    return (
      <PageShell className="flex min-h-full flex-col items-center justify-center p-8">
        <div className="page-card max-w-md text-center">
          <ErrorAlert message={error} />
          <Link to="/" className="btn-primary mt-4 inline-flex">
            Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!ticket) return null;

  const statusOptions = getStatusSelectOptions(ticket.status);

  return (
    <>
      <Modal
        open={showSuccessModal}
        title="Changes saved"
        message="Your ticket was updated successfully. Returning to the dashboard..."
      />

      <PageShell scrollable className="p-5">
        <div className="mx-auto max-w-3xl">
          <div className="page-card animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition hover:text-sky-500 dark:text-sky-400"
                >
                  ← Back to board
                </Link>
                <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  {ticket.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  {!canChangeStatus ? <StatusBadge status={ticket.status} /> : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {comments.length} comments
                  </span>
                </div>
              </div>
            </div>

            {error ? <ErrorAlert className="mt-4" message={error} /> : null}
            {Object.keys(fieldErrors).length > 0 ? (
              <FieldErrorsNotice>
                Please fix the highlighted fields below before saving again.
              </FieldErrorsNotice>
            ) : null}

            <form onSubmit={handleSave} className="mt-6 space-y-5">
            {canChangeStatus ? (
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Move to
                <Select
                  value={status}
                  disabled={statusOptions.length <= 1}
                  onChange={(value) => {
                    setStatus(value);
                    clearFieldError("status");
                    setError(null);
                  }}
                  options={statusOptions.map((value) => ({
                    value,
                    label: TICKET_STATUS_LABELS[value],
                  }))}
                  className="mt-1"
                  hasError={Boolean(fieldErrors.status)}
                  aria-invalid={Boolean(fieldErrors.status)}
                  aria-describedby={fieldErrors.status ? "status-error" : undefined}
                />
                {fieldErrors.status ? (
                  <p id="status-error" className="mt-1 text-xs text-red-500">
                    {fieldErrors.status}
                  </p>
                ) : null}
              </label>
            ) : null}

            <label className="block text-sm font-medium text-slate-700">
              Title
              <input
                type="text"
                required
                minLength={3}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                  setError(null);
                }}
                className={detailInputClassName(Boolean(fieldErrors.title))}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
              />
              {fieldErrors.title ? (
                <p id="title-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.title}
                </p>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                required
                minLength={10}
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError("description");
                  setError(null);
                }}
                className={detailInputClassName(Boolean(fieldErrors.description))}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "description-error" : undefined}
              />
              {fieldErrors.description ? (
                <p id="description-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.description}
                </p>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
              <Select
                value={priority}
                onChange={(value) => {
                  setPriority(value);
                  clearFieldError("priority");
                  setError(null);
                }}
                options={PRIORITIES.map((value) => ({ value, label: value }))}
                className="mt-1"
                hasError={Boolean(fieldErrors.priority)}
                aria-invalid={Boolean(fieldErrors.priority)}
                aria-describedby={fieldErrors.priority ? "priority-error" : undefined}
              />
              {fieldErrors.priority ? (
                <p id="priority-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.priority}
                </p>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={saving || showSuccessModal}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <CommentList
            comments={comments}
            loading={commentsLoading}
            error={commentsError}
            submitting={commentSubmitting}
            onSubmit={handleAddComment}
          />
          </div>
        </div>
      </PageShell>
    </>
  );
}
