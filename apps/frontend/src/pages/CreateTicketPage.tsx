import { useNavigate } from "react-router-dom";

import { createTicket } from "../api/tickets";
import PageShell from "../components/layout/PageShell";
import TicketForm from "../components/TicketForm";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  return (
    <PageShell scrollable className="p-5">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 animate-fade-up">
          <p className="section-label">New ticket</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Create a support request
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Describe the issue and we&apos;ll route it to the right team.
          </p>
        </div>
        <div className="page-card animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <TicketForm
            onSubmit={async (payload) => {
              await createTicket(payload);
              navigate("/");
            }}
          />
        </div>
      </div>
    </PageShell>
  );
}
