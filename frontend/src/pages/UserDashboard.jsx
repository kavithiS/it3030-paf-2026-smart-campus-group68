import React, { useState } from "react";
import { Plus, CalendarCheck2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import CreateTicketModal from "../components/CreateTicketModal";
import TicketList from "../components/TicketList";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!user) return null;

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/user-dashboard",
    },
  ];

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
          Manage your maintenance tickets and requests from one place.
        </p>
      </section>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">My Tickets</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Ticket
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <TicketList key={refreshTrigger} />
      </section>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTicketCreated}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
