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
    <section className="mt-8 border-t border-slate-200 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
        <span className="text-sm text-slate-400">{comments.length} total</span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading comments...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No comments yet. Be the first to reply.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">{comment.createdBy.name}</p>
                <time className="text-xs text-slate-400" dateTime={comment.createdAt}>
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{comment.message}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700">
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
            className={`${inputClassName(Boolean(fieldError))} mt-1 rounded-xl bg-white py-2.5`}
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
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>
    </section>
  );
}
