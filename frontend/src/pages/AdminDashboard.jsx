import React from "react";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, LayoutGrid, Wrench, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { getRoleAccent, getSidebarItems } from "../utils/dashboardConfig";

const badgeClass = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  const accent = getRoleAccent("ADMIN");
  const sidebarItems = useMemo(() => getSidebarItems("ADMIN"), []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get("/bookings", {
          params: { page: 0, size: 5 },
        });
        setBookings(res.data?.content || []);
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    };

    loadBookings();
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Admin Dashboard"
      items={sidebarItems}
      displayRole="ADMIN"
      {...accent}
    >
      <section className={`relative overflow-hidden rounded-[2rem] border border-white/20 p-8 text-white shadow-xl ${accent.accentClassName}`}>
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/10 blur-[50px] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-black/10 blur-[50px] mix-blend-overlay"></div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 drop-shadow-sm">
            ADMIN ACCESS
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl drop-shadow-sm tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="mt-3 text-sm font-medium text-white/90 drop-shadow-sm max-w-lg leading-relaxed">
            You are now in the centralized admin operations workspace. Manage facilities, review requests, and oversee platform status.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/resources")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent.accentClassName}`}>
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-[0.95rem] font-extrabold text-slate-900 dark:text-slate-100">Manage Facilities</h3>
        </article>

        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/bookings")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${accent.accentClassName}`}>
            <CalendarCheck2 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-[0.95rem] font-extrabold text-slate-900 dark:text-slate-100">Review Bookings</h3>
        </article>

        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/tickets")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent.accentClassName}`}>
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-[0.95rem] font-extrabold text-slate-900 dark:text-slate-100">Assign Tickets</h3>
        </article>

        <article
          className="group cursor-pointer rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          onClick={() => navigate("/notifications")}
        >
          <div className={`mb-4 inline-flex rounded-xl p-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${accent.accentClassName}`}>
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-[0.95rem] font-extrabold text-slate-900 dark:text-slate-100">Notifications</h3>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            Latest Booking Requests
          </h3>
          <button
            type="button"
            className="rounded-full border border-slate-300/80 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-white/20 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => navigate("/bookings")}
          >
            Manage All
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:border-white/10 dark:bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-left font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Resource</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{booking.userName}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{booking.resourceName}</td>
                    <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">{booking.bookingDate}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${badgeClass[booking.status] || "bg-slate-200 text-slate-700"}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center font-medium text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarCheck2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p>No booking requests found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
