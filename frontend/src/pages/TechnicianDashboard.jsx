import React from "react";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, LayoutGrid, Wrench, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { getRoleAccent, getSidebarItems } from "../utils/dashboardConfig";

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

const TechnicianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [notes, setNotes] = useState({});

  const accent = getRoleAccent("TECHNICIAN");
  const sidebarItems = useMemo(() => getSidebarItems("TECHNICIAN"), []);

  useEffect(() => {
    const loadAssignedTickets = async () => {
      try {
        const res = await api.get("/tickets/assigned", {
          params: { page: 0, size: 5 },
        });
        setTickets(res.data?.content || []);
      } catch (error) {
        console.error("Failed to load assigned tickets", error);
      }
    };

    loadAssignedTickets();
  }, []);

  const updateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, {
        status,
        resolutionNotes: notes[ticketId] || "",
      });
      const res = await api.get("/tickets/assigned", {
        params: { page: 0, size: 5 },
      });
      setTickets(res.data?.content || []);
    } catch (error) {
      console.error("Failed to update ticket status", error);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Technician Dashboard"
      items={sidebarItems}
      displayRole="TECHNICIAN"
      {...accent}
    >
      <section className={`relative overflow-hidden rounded-[2rem] border border-white/20 p-8 text-white shadow-xl ${accent.accentClassName}`}>
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/10 blur-[50px] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-black/10 blur-[50px] mix-blend-overlay"></div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 drop-shadow-sm">
            TECHNICIAN ACCESS
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl drop-shadow-sm tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="mt-3 text-sm font-medium text-white/90 drop-shadow-sm max-w-lg leading-relaxed">
            You are now in the technician workspace. Review assigned tickets, update resolution statuses, and keep operations running smoothly.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/resources")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${accent.accentClassName}`}>
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Facilities Catalogue</h3>
        </article>

        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/tickets")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent.accentClassName}`}>
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Assigned Tickets</h3>
        </article>

        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/notifications")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${accent.accentClassName}`}>
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Notifications</h3>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            Assigned Tickets
          </h3>
          <button
            type="button"
            className="rounded-full border border-slate-300/80 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-white/20 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => navigate("/tickets")}
          >
            View All
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 pb-3 dark:border-white/5">
                <h4 className="text-[0.95rem] font-bold text-slate-900 dark:text-slate-100">
                  {ticket.category}
                </h4>
                <span className="inline-flex items-center rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm">
                  {ticket.status}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2">
                {ticket.description}
              </p>
              <div className="mt-4 space-y-3">
                <textarea
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-sm font-medium placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
                  rows={2}
                  placeholder="Enter resolution notes here..."
                  value={notes[ticket.id] || ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                  }
                />
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
          {tickets.length === 0 && (
            <div className="col-span-full py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Wrench className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                No assigned tickets right now.
              </p>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
