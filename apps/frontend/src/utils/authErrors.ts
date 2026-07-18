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

export function inputClassName(hasError: boolean): string {
  return `mt-1 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 ${
    hasError ? "border-red-500 focus:border-red-500" : "border-slate-300"
  }`;
}

export { ApiError };
