import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import MobileNavDrawer from "./MobileNavDrawer";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const contextValue = useMemo(() => ({ search, setSearch }), [search]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          search={search}
          onSearchChange={setSearch}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}
