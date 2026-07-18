import { FormEvent, useState } from "react";

import type { TicketCreateInput, TicketPriority } from "../api/ticketTypes";
import { inputClassName, parseApiError } from "../utils/authErrors";

type TicketFormProps = {
  onSubmit: (payload: TicketCreateInput) => Promise<void>;
  submitLabel?: string;
};

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "critical"];

export default function TicketForm({ onSubmit, submitLabel = "Create ticket" }: TicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit({ title, description, priority });
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {Object.keys(fieldErrors).length > 0 ? (
        <p className="text-sm text-amber-400">Please fix the highlighted fields below.</p>
      ) : null}

      <label className="block text-sm text-slate-700">
        Title
        <input
          type="text"
          required
          minLength={3}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearFieldError("title");
          }}
          className={inputClassName(Boolean(fieldErrors.title))}
        />
        {fieldErrors.title ? <p className="mt-1 text-xs text-red-400">{fieldErrors.title}</p> : null}
      </label>

      <label className="block text-sm text-slate-700">
        Description
        <textarea
          required
          minLength={10}
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError("description");
          }}
          className={inputClassName(Boolean(fieldErrors.description))}
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.description}</p>
        ) : null}
      </label>

      <label className="block text-sm text-slate-700">
        Priority
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
        >
          {PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
