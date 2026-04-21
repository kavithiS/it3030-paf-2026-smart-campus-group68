import React from "react";
import { BellRing, CalendarCheck2, BookMarked } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/user-dashboard",
    },
    {
      key: "my-bookings",
      label: "My Bookings",
      icon: BookMarked,
      route: "/my-bookings",
    },
  ];

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="User Dashboard"
      items={sidebarItems}
      displayRole="USER"
      accentClassName="bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
      accentButtonClassName="bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
      accentTextClassName="text-blue-100/90"
    >
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-6 py-7 text-white shadow-lg shadow-blue-950/15">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
          USER ACCESS
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Welcome User, {user.name}
        </h2>
        <p className="mt-2 text-sm text-blue-50/95">
          Manage your bookings, updates, and requests from one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-1">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <BellRing className="h-6 w-6 text-blue-600" />
          <h3 className="mt-3 text-lg font-bold">Notifications</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            View alerts for service updates and approvals.
          </p>
        </article>
      </section>
    </DashboardLayout>
  );
};

export default UserDashboard;
