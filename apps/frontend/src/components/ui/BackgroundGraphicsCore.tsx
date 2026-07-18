import type { ReactNode } from "react";

export type MotionType = "float" | "float-delayed" | "float-slow" | "drift" | "pulse" | "pulse-delayed";
export type GraphicTheme = "dark" | "light";

const MOTION_CLASS: Record<MotionType, string> = {
  float: "auth-graphic-float",
  "float-delayed": "auth-graphic-float-delayed",
  "float-slow": "auth-graphic-float-slow",
  drift: "auth-graphic-drift",
  pulse: "auth-graphic-pulse",
  "pulse-delayed": "auth-graphic-pulse-delayed",
};

export function MotionWrap({
  motion,
  className = "",
  children,
}: {
  motion: MotionType;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={`absolute ${MOTION_CLASS[motion]} ${className}`}>{children}</div>;
}

const THEME_STYLES = {
  dark: {
    columnFill: "rgb(255 255 255 / 0.06)",
    columnStroke: "rgb(255 255 255 / 0.12)",
    columnBar: "rgb(56 189 248 / 0.5)",
    cardFill: "rgb(255 255 255 / 0.1)",
    cardStroke: "rgb(56 189 248 / 0.35)",
    cardIcon: "rgb(56 189 248 / 0.2)",
    cardLine: "rgb(255 255 255 / 0.35)",
    cardLineDim: "rgb(255 255 255 / 0.15)",
    cardBadge: "rgb(99 102 241 / 0.35)",
    chatFill: "rgb(255 255 255 / 0.08)",
    chatStroke: "rgb(129 140 248 / 0.4)",
    checkFill: "rgb(16 185 129 / 0.15)",
    checkStroke: "rgb(52 211 153 / 0.45)",
    checkMark: "rgb(110 231 183 / 0.7)",
    pillBorder: "border-white/20",
    pillBg: "bg-white/10",
    pillDot: "bg-white/30",
  },
  light: {
    columnFill: "rgb(14 165 233 / 0.06)",
    columnStroke: "rgb(14 165 233 / 0.18)",
    columnBar: "rgb(14 165 233 / 0.45)",
    cardFill: "rgb(255 255 255 / 0.85)",
    cardStroke: "rgb(14 165 233 / 0.3)",
    cardIcon: "rgb(14 165 233 / 0.12)",
    cardLine: "rgb(51 65 85 / 0.25)",
    cardLineDim: "rgb(51 65 85 / 0.15)",
    cardBadge: "rgb(99 102 241 / 0.2)",
    chatFill: "rgb(255 255 255 / 0.7)",
    chatStroke: "rgb(99 102 241 / 0.35)",
    checkFill: "rgb(16 185 129 / 0.1)",
    checkStroke: "rgb(16 185 129 / 0.35)",
    checkMark: "rgb(5 150 105 / 0.65)",
    pillBorder: "border-sky-200/80",
    pillBg: "bg-white/70",
    pillDot: "bg-slate-200",
  },
} as const;

export function KanbanColumnGraphic({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: GraphicTheme;
}) {
  const s = THEME_STYLES[theme];
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="72" height="112" rx="12" fill={s.columnFill} stroke={s.columnStroke} />
      <rect x="12" y="14" width="40" height="6" rx="3" fill={s.columnBar} />
      <rect x="12" y="30" width="56" height="22" rx="6" fill={s.columnFill} stroke={s.columnStroke} />
      <rect x="12" y="58" width="56" height="22" rx="6" fill={s.columnFill} stroke={s.columnStroke} />
      <rect x="12" y="86" width="56" height="22" rx="6" fill={s.columnFill} stroke={s.columnStroke} />
    </svg>
  );
}

export function TicketCardGraphic({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: GraphicTheme;
}) {
  const s = THEME_STYLES[theme];
  return (
    <svg viewBox="0 0 100 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="96" height="66" rx="10" fill={s.cardFill} stroke={s.cardStroke} strokeWidth="1.5" />
      <rect x="12" y="14" width="28" height="28" rx="6" fill={s.cardIcon} />
      <rect x="48" y="16" width="40" height="6" rx="3" fill={s.cardLine} />
      <rect x="48" y="28" width="32" height="4" rx="2" fill={s.cardLineDim} />
      <rect x="12" y="50" width="24" height="10" rx="5" fill={s.cardBadge} />
    </svg>
  );
}

export function ChatBubbleGraphic({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: GraphicTheme;
}) {
  const s = THEME_STYLES[theme];
  return (
    <svg viewBox="0 0 64 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8 6h48a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H24l-12 10V12a6 6 0 0 1 6-6Z"
        fill={s.chatFill}
        stroke={s.chatStroke}
        strokeWidth="1.5"
      />
      <rect x="16" y="18" width="32" height="4" rx="2" fill={s.cardLine} />
      <rect x="16" y="28" width="24" height="4" rx="2" fill={s.cardLineDim} />
    </svg>
  );
}

export function CheckCircleGraphic({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: GraphicTheme;
}) {
  const s = THEME_STYLES[theme];
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill={s.checkFill} stroke={s.checkStroke} strokeWidth="1.5" />
      <path
        d="M15 24.5 21 30.5 33 18.5"
        stroke={s.checkMark}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatusPillGraphic({
  color,
  theme = "dark",
}: {
  color: string;
  theme?: GraphicTheme;
}) {
  const s = THEME_STYLES[theme];
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm ${s.pillBorder} ${s.pillBg}`}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className={`h-1.5 w-10 rounded-full ${s.pillDot}`} />
    </div>
  );
}
