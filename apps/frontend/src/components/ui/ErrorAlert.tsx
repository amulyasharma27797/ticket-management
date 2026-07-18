import type { ReactNode } from "react";

type ErrorAlertProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorAlert({ message, title, onRetry, className = "" }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 ${className}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <p className={title ? "mt-1" : undefined}>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-700 underline underline-offset-2 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function FieldErrorsNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
      {children ?? "Please fix the highlighted fields below."}
    </p>
  );
}
