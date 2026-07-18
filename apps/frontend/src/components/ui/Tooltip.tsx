import type { ReactNode } from "react";

type TooltipProps = {
  content: ReactNode;
  label: string;
  children: ReactNode;
  side?: "left" | "right";
};

const SIDE_CONFIG = {
  left: {
    position: "right-full top-1/2 mr-3 -translate-y-1/2 origin-right",
    enter: "translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0",
    card: "tooltip-card-left",
  },
  right: {
    position: "left-full top-1/2 ml-3 -translate-y-1/2 origin-left",
    enter: "-translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0",
    card: "tooltip-card-right",
  },
} as const;

export default function Tooltip({ content, label, children, side = "left" }: TooltipProps) {
  const config = SIDE_CONFIG[side];

  return (
    <div className="group relative flex">
      <div
        tabIndex={0}
        aria-label={label}
        className="flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-offset-slate-950"
      >
        {children}
      </div>
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[100] ${config.position} scale-[0.97] opacity-0 transition-all duration-200 ease-out ${config.enter} group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100`}
      >
        <div className={`tooltip-card ${config.card}`}>{content}</div>
      </div>
    </div>
  );
}
