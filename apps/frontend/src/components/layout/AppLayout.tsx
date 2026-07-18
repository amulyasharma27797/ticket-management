import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import RightSidebar from "./RightSidebar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [search, setSearch] = useState("");

  const contextValue = useMemo(() => ({ search, setSearch }), [search]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header search={search} onSearchChange={setSearch} />
        <div className="flex min-h-0 flex-1">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet context={contextValue} />
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
