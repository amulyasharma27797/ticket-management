import { useCallback, useMemo, useState, type ReactNode } from "react";

import { ToastContext, type ToastItem, type ToastVariant } from "../hooks/useToast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-fade-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${
              toast.variant === "success"
                ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/90 dark:text-emerald-100"
                : "border-red-200/80 bg-red-50/95 text-red-700 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
