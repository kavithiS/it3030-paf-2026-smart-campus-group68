import React from "react";
import { CalendarCheck2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import TicketList from "../components/TicketList";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/admin-dashboard",
    },
  ];

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Admin Dashboard"
      items={sidebarItems}
      displayRole="ADMIN"
      accentClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentButtonClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentTextClassName="text-blue-100/90"
    >
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[#1E2A50] to-[#3B4A89] px-6 py-7 text-white shadow-lg shadow-blue-950/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
          ADMIN ACCESS
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Welcome Admin, {user.name}
        </h2>
        <p className="mt-2 text-sm text-blue-50/95">
          Manage incidents by assigning technicians, reviewing progress, and closing requests.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Tickets</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Open a ticket to assign or reject it</p>
        </div>
        <TicketList />
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
