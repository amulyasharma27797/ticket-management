import { FormEvent, useState } from "react";

import type { Comment } from "../../api/commentTypes";
import { inputClassName, parseApiError } from "../../utils/authErrors";

type CommentListProps = {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onSubmit: (message: string) => Promise<void>;
};

function formatCommentDate(value: string): string {
  return new Date(value).toLocaleString();
}

function authorInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CommentList({
  comments,
  loading,
  error,
  submitting,
  onSubmit,
}: CommentListProps) {
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setFieldError("Comment cannot be empty.");
      return;
    }

    setFieldError(null);
    setSubmitError(null);
    try {
      await onSubmit(trimmed);
      setMessage("");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldError(parsed.fieldErrors.message ?? null);
      setSubmitError(parsed.message ?? "Failed to add comment.");
    }
  }

  return (
    <section className="mt-8 border-t border-slate-200/80 pt-6 dark:border-slate-700/60">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Comments</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {comments.length} total
        </span>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Loading comments...
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No comments yet. Be the first to reply.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-bubble">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-[10px] font-bold text-white">
                  {authorInitials(comment.createdBy.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {comment.createdBy.name}
                    </p>
                    <time className="text-xs text-slate-400" dateTime={comment.createdAt}>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {comment.message}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Add a comment
          <textarea
            rows={4}
            value={message}
            maxLength={2000}
            disabled={submitting}
            onChange={(event) => {
              setMessage(event.target.value);
              setFieldError(null);
              setSubmitError(null);
            }}
            className={`${inputClassName(Boolean(fieldError))} mt-1`}
            placeholder="Share an update or ask a question..."
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "comment-error" : undefined}
          />
        </label>
        {fieldError ? (
          <p id="comment-error" className="text-xs text-red-500">
            {fieldError}
          </p>
        ) : null}
        {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>
    </section>
  );
}
