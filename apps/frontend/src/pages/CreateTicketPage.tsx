import { useNavigate } from "react-router-dom";

import { createTicket } from "../api/tickets";
import TicketForm from "../components/TicketForm";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  return (
    <div className="page-gradient min-h-full overflow-auto p-5">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create ticket</h1>
        <p className="mt-2 text-sm text-slate-500">Describe the issue you need help with.</p>
        <div className="mt-6">
          <TicketForm
            onSubmit={async (payload) => {
              await createTicket(payload);
              navigate("/");
            }}
          />
        </div>
      </div>
    </div>
  );
}
