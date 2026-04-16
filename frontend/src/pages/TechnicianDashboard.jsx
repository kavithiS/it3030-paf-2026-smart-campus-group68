import React from "react";
import { CalendarCheck2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const TechnicianDashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/technician-dashboard",
    },
  ];

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Technician Dashboard"
      items={sidebarItems}
      displayRole="TECHNICIAN"
      accentClassName="bg-gradient-to-r from-[#0F4C5C] to-[#176D7A]"
      accentButtonClassName="bg-gradient-to-r from-[#0F4C5C] to-[#176D7A]"
      accentTextClassName="text-cyan-100/90"
    >
      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-[#0F4C5C] to-[#176D7A] px-6 py-7 text-white shadow-lg shadow-cyan-950/15">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/90">
          TECHNICIAN ACCESS
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Welcome Technician, {user.name}
        </h2>
        <p className="mt-2 text-sm text-cyan-50/95">
          You are now in the technician workspace.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Main Responsibilities
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="font-medium text-cyan-700 dark:text-cyan-300">
            🎯 Handle Tickets
          </li>
        </ul>
      </section>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
