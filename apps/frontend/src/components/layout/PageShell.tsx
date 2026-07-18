import type { ReactNode } from "react";

import AppBackgroundGraphics from "../ui/AppBackgroundGraphics";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Full-height flex column (dashboard). Default scrollable page layout when false. */
  fill?: boolean;
  scrollable?: boolean;
};

export default function PageShell({
  children,
  className = "",
  fill = false,
  scrollable = false,
}: PageShellProps) {
  const layoutClass = fill
    ? "flex h-full min-h-0 flex-col"
    : scrollable
      ? "app-scrollbar min-h-full overflow-auto"
      : "min-h-full";

  const contentClass = fill ? "relative z-10 flex min-h-0 flex-1 flex-col" : "relative z-10";

  return (
    <div className={`page-gradient relative ${layoutClass} ${className}`}>
      <AppBackgroundGraphics />
      <div className={contentClass}>{children}</div>
    </div>
  );
}
