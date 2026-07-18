import { FormEvent, useState } from "react";

import type { TicketCreateInput, TicketPriority } from "../api/ticketTypes";
import Select from "./ui/Select";
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {Object.keys(fieldErrors).length > 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          Please fix the highlighted fields below.
        </p>
      ) : null}

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
          placeholder="Brief summary of the issue"
        />
        {fieldErrors.title ? <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p> : null}
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
          placeholder="Provide details so the team can help quickly..."
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>
        ) : null}
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Priority
        <Select
          value={priority}
          onChange={setPriority}
          options={PRIORITIES.map((value) => ({ value, label: value }))}
          className="mt-1"
        />
      </label>

      <button type="submit" disabled={submitting} className="btn-primary-full">
        {submitting ? "Creating..." : submitLabel}
      </button>
    </form>
  );
}
