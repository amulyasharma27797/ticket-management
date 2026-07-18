import { Link } from "react-router-dom";

type LogoSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<LogoSize, { box: string; text: string }> = {
  sm: { box: "h-8 w-8 rounded-xl", text: "text-[10px]" },
  md: { box: "h-10 w-10 rounded-xl", text: "text-xs" },
  lg: { box: "h-11 w-11 rounded-2xl", text: "text-sm" },
};

type LogoMarkProps = {
  size?: LogoSize;
  className?: string;
};

/** Gradient badge with ticket-flow icon + TF monogram */
export function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-600 shadow-glow ${styles.box} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28 8H12a3 3 0 0 0-3 3v2.5L20 18l11-4.5V11a3 3 0 0 0-3-3Z"
          fill="rgb(255 255 255 / 0.18)"
          stroke="rgb(255 255 255 / 0.35)"
          strokeWidth="1.2"
        />
        <path
          d="M9 14.5c6 2.5 12 2.5 22 0"
          stroke="rgb(255 255 255 / 0.25)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M10 28c5-3 15-3 20 0"
          stroke="rgb(255 255 255 / 0.2)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <span className={`relative z-10 font-extrabold tracking-tight text-white ${styles.text}`}>TF</span>
    </div>
  );
}

type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  textTone?: "light" | "dark";
  className?: string;
  href?: string;
};

/** Logo mark with optional TicketFlow wordmark */
export function Logo({
  size = "md",
  showText = true,
  textTone = "dark",
  className = "",
  href,
}: LogoProps) {
  const textClass =
    textTone === "light"
      ? "text-lg font-semibold text-white"
      : "text-lg font-semibold text-slate-900";

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {showText ? <span className={textClass}>TicketFlow</span> : null}
    </div>
  );

  if (href) {
    return (
      <Link to={href} title="TicketFlow home" className="inline-flex transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
