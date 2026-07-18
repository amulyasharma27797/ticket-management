import { ApiError } from "../api/client";

export type ParsedApiError = {
  message: string | null;
  fieldErrors: Record<string, string>;
  code: string | null;
};

const GENERIC_VALIDATION_MESSAGES = new Set([
  "Request validation failed",
  "Please fix the highlighted fields.",
]);

const GENERIC_SERVER_MESSAGES = new Set([
  ...GENERIC_VALIDATION_MESSAGES,
  "Unauthorized",
  "Forbidden",
  "Resource not found",
  "Invalid ticket status transition",
  "Ticket cannot be edited in its current status",
  "An unexpected error occurred. Please try again later.",
]);

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource could not be found.",
  CONFLICT: "This action conflicts with existing data.",
  VALIDATION_ERROR: "Please check the form and try again.",
  INVALID_STATUS_TRANSITION: "That status change is not allowed for this ticket.",
  TICKET_NOT_EDITABLE: "This ticket can no longer be edited.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again later.",
};

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

function extractErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) {
    return error.code;
  }
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return null;
}

export function parseApiError(error: unknown): ParsedApiError {
  const fieldErrors: Record<string, string> = {};
  const code = extractErrorCode(error);

  for (const detail of extractErrorDetails(error)) {
    const key = normalizeField(detail.field);
    if (!fieldErrors[key]) {
      fieldErrors[key] = detail.message;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: null, fieldErrors, code };
  }

  const message = extractErrorMessage(error);
  if (GENERIC_VALIDATION_MESSAGES.has(message)) {
    return {
      message: FRIENDLY_ERROR_MESSAGES.VALIDATION_ERROR,
      fieldErrors,
      code: code ?? "VALIDATION_ERROR",
    };
  }

  return { message, fieldErrors, code };
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const parsed = parseApiError(error);

  if (Object.keys(parsed.fieldErrors).length > 0) {
    return Object.entries(parsed.fieldErrors)
      .map(([field, detail]) => `${field}: ${detail}`)
      .join(". ");
  }

  if (parsed.message && !GENERIC_SERVER_MESSAGES.has(parsed.message)) {
    return parsed.message;
  }

  if (parsed.code && FRIENDLY_ERROR_MESSAGES[parsed.code]) {
    return FRIENDLY_ERROR_MESSAGES[parsed.code];
  }

  return parsed.message ?? fallback;
}

export function getAuthErrorMessage(error: unknown): string {
  return getErrorMessage(error, "Something went wrong");
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
