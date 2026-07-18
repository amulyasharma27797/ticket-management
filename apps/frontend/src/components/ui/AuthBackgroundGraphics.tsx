import {
  ChatBubbleGraphic,
  CheckCircleGraphic,
  KanbanColumnGraphic,
  MotionWrap,
  StatusPillGraphic,
  TicketCardGraphic,
} from "./BackgroundGraphicsCore";

export function AuthBrandGraphics() {
  return (
    <div className="auth-brand-graphics pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
      <MotionWrap motion="drift" className="inset-0 h-full w-full opacity-50">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="auth-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(129 140 248)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M 120 280 Q 280 200 420 320 T 700 260"
            stroke="url(#auth-line-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            fill="none"
          />
          <path
            d="M 80 520 Q 300 440 500 560 T 760 480"
            stroke="url(#auth-line-grad)"
            strokeWidth="1"
            strokeDasharray="4 10"
            fill="none"
            opacity="0.6"
          />
          <circle cx="120" cy="280" r="4" fill="rgb(56 189 248 / 0.5)" />
          <circle cx="420" cy="320" r="3" fill="rgb(129 140 248 / 0.5)" />
          <circle cx="700" cy="260" r="4" fill="rgb(56 189 248 / 0.4)" />
        </svg>
      </MotionWrap>

      <MotionWrap motion="float" className="right-[8%] top-[18%] h-28 w-20 opacity-80">
        <KanbanColumnGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float-delayed" className="right-[22%] top-[32%] h-24 w-[4.5rem] opacity-65">
        <KanbanColumnGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="float-slow" className="bottom-[28%] right-[12%] h-20 w-28 opacity-90">
        <TicketCardGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float" className="left-[6%] top-[42%] h-16 w-24 opacity-75">
        <TicketCardGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="drift" className="left-[20%] top-[20%] h-14 w-20 opacity-50">
        <TicketCardGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="float-delayed" className="bottom-[38%] left-[10%] h-16 w-20 opacity-80">
        <ChatBubbleGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="drift" className="right-[30%] bottom-[12%] h-12 w-16 opacity-55">
        <ChatBubbleGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float-slow" className="right-[6%] bottom-[18%] h-14 w-14 opacity-85">
        <CheckCircleGraphic theme="dark" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="pulse" className="left-[30%] top-[22%] h-2 w-2 rounded-full bg-sky-300/70" />
      <MotionWrap motion="pulse-delayed" className="left-[55%] top-[55%] h-1.5 w-1.5 rounded-full bg-indigo-300/60" />
      <MotionWrap motion="pulse" className="right-[35%] top-[48%] h-2 w-2 rounded-full bg-violet-300/60" />
      <MotionWrap motion="pulse-delayed" className="left-[18%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-emerald-300/60" />
    </div>
  );
}

export function AuthFormGraphics() {
  return (
    <div className="auth-form-graphics pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <MotionWrap motion="float" className="-right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <MotionWrap motion="float-delayed" className="-bottom-28 -left-16 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      <MotionWrap motion="drift" className="right-1/4 top-1/3 h-48 w-48 rounded-full bg-violet-200/25 blur-2xl" />

      <MotionWrap motion="float" className="right-[6%] top-[12%] h-24 w-32 opacity-[0.22] lg:opacity-[0.18]">
        <TicketCardGraphic theme="light" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float-delayed" className="left-[4%] top-[28%] h-20 w-28 opacity-[0.2] lg:opacity-[0.16]">
        <TicketCardGraphic theme="light" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="drift" className="right-[18%] bottom-[22%] h-16 w-24 opacity-[0.18]">
        <TicketCardGraphic theme="light" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="float-slow" className="-left-6 bottom-[18%] h-32 w-24 opacity-[0.15] lg:opacity-[0.12]">
        <KanbanColumnGraphic theme="light" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[-2%] bottom-[8%] h-28 w-20 opacity-[0.14]">
        <KanbanColumnGraphic theme="light" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="float-delayed" className="left-[12%] bottom-[10%] h-20 w-24 opacity-[0.2]">
        <ChatBubbleGraphic theme="light" className="h-full w-full" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[10%] top-[42%] h-16 w-16 opacity-[0.18]">
        <CheckCircleGraphic theme="light" className="h-full w-full" />
      </MotionWrap>

      <MotionWrap motion="drift" className="left-[8%] top-[14%] opacity-70">
        <StatusPillGraphic color="bg-sky-500" theme="light" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[28%] top-[58%] opacity-60">
        <StatusPillGraphic color="bg-emerald-500" theme="light" />
      </MotionWrap>
      <MotionWrap motion="float-delayed" className="left-[30%] bottom-[32%] opacity-55">
        <StatusPillGraphic color="bg-amber-500" theme="light" />
      </MotionWrap>

      <MotionWrap motion="float" className="right-8 top-10 h-20 w-20 opacity-[0.2]">
        <svg className="h-full w-full" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="40" rx="8" stroke="rgb(14 165 233)" strokeWidth="2" />
          <path d="M8 22h48" stroke="rgb(14 165 233)" strokeWidth="2" />
          <circle cx="20" cy="34" r="6" fill="rgb(99 102 241 / 0.5)" />
          <rect x="30" y="30" width="18" height="3" rx="1.5" fill="rgb(14 165 233 / 0.6)" />
          <rect x="30" y="37" width="12" height="3" rx="1.5" fill="rgb(14 165 233 / 0.4)" />
        </svg>
      </MotionWrap>

      <MotionWrap motion="float-delayed" className="bottom-12 left-8 h-16 w-16 opacity-[0.18]">
        <svg className="h-full w-full" viewBox="0 0 56 56" fill="none">
          <path
            d="M8 10h32a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H20l-8 8V14a4 4 0 0 1 4-4Z"
            stroke="rgb(99 102 241)"
            strokeWidth="2"
            fill="rgb(99 102 241 / 0.12)"
          />
          <rect x="14" y="18" width="20" height="2.5" rx="1.25" fill="rgb(99 102 241 / 0.5)" />
          <rect x="14" y="24" width="14" height="2.5" rx="1.25" fill="rgb(99 102 241 / 0.35)" />
        </svg>
      </MotionWrap>

      <MotionWrap motion="drift" className="left-1/2 top-[6%] h-12 w-40 -translate-x-1/2 opacity-[0.15]">
        <svg className="h-full w-full" viewBox="0 0 160 48" fill="none">
          <rect x="4" y="8" width="44" height="32" rx="6" fill="rgb(14 165 233 / 0.15)" stroke="rgb(14 165 233 / 0.35)" />
          <rect x="58" y="8" width="44" height="32" rx="6" fill="rgb(99 102 241 / 0.12)" stroke="rgb(99 102 241 / 0.3)" />
          <rect x="112" y="8" width="44" height="32" rx="6" fill="rgb(16 185 129 / 0.12)" stroke="rgb(16 185 129 / 0.3)" />
        </svg>
      </MotionWrap>

      <div className="auth-form-dots absolute inset-0 opacity-50" />
    </div>
  );
}
