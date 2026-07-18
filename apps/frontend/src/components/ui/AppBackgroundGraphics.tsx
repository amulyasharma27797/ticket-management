import {
  ChatBubbleGraphic,
  CheckCircleGraphic,
  KanbanColumnGraphic,
  MotionWrap,
  StatusPillGraphic,
  TicketCardGraphic,
} from "./BackgroundGraphicsCore";

/** Animated background graphics for authenticated app pages (light theme). */
export default function AppBackgroundGraphics() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <MotionWrap motion="float" className="-right-16 -top-16 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-600/15" />
      <MotionWrap motion="float-delayed" className="-bottom-24 -left-12 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-600/12" />
      <MotionWrap motion="drift" className="right-1/4 top-1/4 h-56 w-56 rounded-full bg-violet-200/20 blur-2xl dark:bg-violet-600/10" />

      <MotionWrap motion="float" className="right-[4%] top-[8%] h-28 w-36 opacity-[0.35] dark:opacity-[0.2]">
        <TicketCardGraphic theme="light" className="h-full w-full dark:hidden" />
        <TicketCardGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>
      <MotionWrap motion="float-delayed" className="left-[2%] top-[20%] h-24 w-32 opacity-[0.3] dark:opacity-[0.18]">
        <TicketCardGraphic theme="light" className="h-full w-full dark:hidden" />
        <TicketCardGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>
      <MotionWrap motion="drift" className="right-[15%] bottom-[18%] h-20 w-28 opacity-[0.28] dark:opacity-[0.16]">
        <TicketCardGraphic theme="light" className="h-full w-full dark:hidden" />
        <TicketCardGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>

      <MotionWrap motion="float-slow" className="-left-4 bottom-[12%] h-36 w-28 opacity-[0.25] dark:opacity-[0.14]">
        <KanbanColumnGraphic theme="light" className="h-full w-full dark:hidden" />
        <KanbanColumnGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[1%] bottom-[6%] h-32 w-24 opacity-[0.22] dark:opacity-[0.12]">
        <KanbanColumnGraphic theme="light" className="h-full w-full dark:hidden" />
        <KanbanColumnGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>

      <MotionWrap motion="float-delayed" className="left-[10%] bottom-[8%] h-20 w-24 opacity-[0.3] dark:opacity-[0.18]">
        <ChatBubbleGraphic theme="light" className="h-full w-full dark:hidden" />
        <ChatBubbleGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[12%] top-[38%] h-16 w-16 opacity-[0.28] dark:opacity-[0.16]">
        <CheckCircleGraphic theme="light" className="h-full w-full dark:hidden" />
        <CheckCircleGraphic theme="dark" className="hidden h-full w-full dark:block" />
      </MotionWrap>

      <MotionWrap motion="drift" className="left-[6%] top-[12%] opacity-60 dark:opacity-50">
        <StatusPillGraphic color="bg-sky-500" theme="light" />
      </MotionWrap>
      <MotionWrap motion="float" className="right-[30%] top-[55%] opacity-55 dark:opacity-45">
        <StatusPillGraphic color="bg-emerald-500" theme="light" />
      </MotionWrap>
      <MotionWrap motion="float-delayed" className="left-[35%] bottom-[28%] opacity-50 dark:opacity-40">
        <StatusPillGraphic color="bg-amber-500" theme="light" />
      </MotionWrap>

      <MotionWrap motion="drift" className="left-1/2 top-[4%] h-12 w-44 -translate-x-1/2 opacity-[0.2] dark:opacity-[0.12]">
        <svg className="h-full w-full" viewBox="0 0 160 48" fill="none">
          <rect x="4" y="8" width="44" height="32" rx="6" fill="rgb(14 165 233 / 0.1)" stroke="rgb(14 165 233 / 0.25)" />
          <rect x="58" y="8" width="44" height="32" rx="6" fill="rgb(99 102 241 / 0.08)" stroke="rgb(99 102 241 / 0.2)" />
          <rect x="112" y="8" width="44" height="32" rx="6" fill="rgb(16 185 129 / 0.08)" stroke="rgb(16 185 129 / 0.2)" />
        </svg>
      </MotionWrap>

      <div className="app-page-dots absolute inset-0 opacity-40 dark:opacity-25" />
    </div>
  );
}
