import { ApiError } from "../api/client";

export type ParsedApiError = {
  message: string | null;
  fieldErrors: Record<string, string>;
};

const GENERIC_VALIDATION_MESSAGES = new Set([
  "Request validation failed",
  "Please fix the highlighted fields.",
]);

function normalizeField(field: string): string {
  const cleaned = field.replace(/^body\./, "");
  const parts = cleaned.split(".");
  return parts[parts.length - 1] || cleaned;
}

function extractErrorDetails(error: unknown): Array<{ field: string; message: string }> {
  if (!error || typeof error !== "object" || !("details" in error)) {
    return [];
  }

  const details = (error as { details?: unknown }).details;
  if (!Array.isArray(details)) {
    return [];
  }

  return details.filter(
    (detail): detail is { field: string; message: string } =>
      detail != null &&
      typeof detail === "object" &&
      "field" in detail &&
      "message" in detail &&
      typeof detail.field === "string" &&
      typeof detail.message === "string",
  );
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

export function parseApiError(error: unknown): ParsedApiError {
  const fieldErrors: Record<string, string> = {};

  for (const detail of extractErrorDetails(error)) {
    const key = normalizeField(detail.field);
    if (!fieldErrors[key]) {
      fieldErrors[key] = detail.message;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: null, fieldErrors };
  }

  const message = extractErrorMessage(error);
  if (GENERIC_VALIDATION_MESSAGES.has(message)) {
    return { message: "Please check the form and try again.", fieldErrors };
  }

  return { message, fieldErrors };
}

export function getAuthErrorMessage(error: unknown): string {
  const { message, fieldErrors } = parseApiError(error);
  if (message) {
    return message;
  }

  return Object.entries(fieldErrors)
    .map(([field, detail]) => `${field}: ${detail}`)
    .join(". ");
}

export function authInputClassName(hasError: boolean): string {
  return `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400/50 ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-400/40"
      : "border-slate-300 hover:border-sky-400 focus:border-sky-500"
  }`;
}

export function inputClassName(hasError: boolean): string {
  return `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400/50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:ring-sky-500/30 ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-400/40"
      : "border-slate-200 hover:border-sky-300 dark:hover:border-slate-500"
  }`;
}

export function selectTriggerClassName(hasError = false, extra = ""): string {
  return [
    "relative rounded-xl border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm transition",
    "focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:border-sky-500 dark:focus:ring-sky-500/30",
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-400/40"
      : "border-slate-200 hover:border-sky-300 dark:hover:border-slate-500",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/** @deprecated Use Select component or selectTriggerClassName */
export function selectClassName(hasError = false, extra = ""): string {
  return ["app-select", selectTriggerClassName(hasError, extra)].filter(Boolean).join(" ");
}

export { ApiError };
