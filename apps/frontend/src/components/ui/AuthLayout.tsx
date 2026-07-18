import type { ReactNode } from "react";

import { AuthBrandGraphics, AuthFormGraphics } from "./AuthBackgroundGraphics";
import { Logo } from "./Logo";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

const FEATURES = [
  { icon: "📋", text: "Kanban board with drag-and-drop status updates" },
  { icon: "🔍", text: "Search, filter, and paginate across all tickets" },
  { icon: "💬", text: "Threaded comments on every support request" },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left branding panel — desktop only */}
      <div className="auth-mesh auth-grid relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="auth-brand-overlay" aria-hidden="true" />
        <AuthBrandGraphics />
        <div className="auth-orb auth-graphic-float -left-20 top-20 z-0 h-72 w-72 bg-sky-600/15" />
        <div className="auth-orb auth-graphic-float-delayed right-10 top-1/3 z-0 h-56 w-56 bg-indigo-600/12" />
        <div className="auth-orb auth-graphic-float-slow bottom-20 left-1/3 z-0 h-64 w-64 bg-violet-600/10" />

        <div className="relative z-10 animate-fade-up">
          <Logo size="lg" textTone="light" href="/" />
        </div>

        <div className="relative z-10 animate-fade-up space-y-6" style={{ animationDelay: "0.1s" }}>
          <h2 className="max-w-md text-4xl font-bold leading-tight text-white">
            Support tickets,{" "}
            <span className="auth-headline-accent">beautifully managed</span>
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-100">
            Track, triage, and resolve customer requests across your entire team — all in one place.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.text}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100"
              >
                <span className="text-lg" aria-hidden="true">
                  {feature.icon}
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-300">
          © {new Date().getFullYear()} TicketFlow · Support Ticket Management
        </p>
      </div>

      {/* Right form panel — always light for readability */}
      <div className="auth-form-panel">
        <AuthFormGraphics />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" textTone="dark" href="/" />
          </div>

          <div className="auth-form-card">
            <p className="auth-section-label">Ticket Management</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
