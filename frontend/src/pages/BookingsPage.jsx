import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { normalizeRoles, useAuth } from "../context/AuthContext";
import {
  getPrimaryRole,
  getRoleAccent,
  getSidebarItems,
} from "../utils/dashboardConfig";

const badgeClass = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-700",
};

const BookingsPage = () => {
  const { user, logout } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const isUser = roles.includes("USER");
  const isAdmin = roles.includes("ADMIN");
  const primaryRole = getPrimaryRole(roles);
  const accent = getRoleAccent(primaryRole);

  const sidebarItems = useMemo(
    () => getSidebarItems(primaryRole),
    [primaryRole],
  );

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [decisionReason, setDecisionReason] = useState({});
  const [form, setForm] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const loadResources = async () => {
    try {
      const res = await api.get("/resources", {
        params: { page: 0, size: 100 },
      });
      setResources(res.data?.content || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load resources.");
    }
  };

  const loadBookings = async () => {
    try {
      const endpoint = isAdmin ? "/bookings" : "/bookings/mine";
      const res = await api.get(endpoint, { params: { page: 0, size: 50 } });
      setBookings(res.data?.content || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookings.");
    }
  };

  useEffect(() => {
    loadResources();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/bookings", form);
      setForm({
        resourceId: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
      });
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create booking.");
    }
  };

  const handleDecision = async (id, action) => {
    try {
      await api.patch(`/bookings/${id}/${action}`, {
        reason: decisionReason[id] || "Reviewed by admin",
      });
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} booking.`);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Booking Management"
      items={sidebarItems}
      displayRole={primaryRole}
      {...accent}
    >
      {isUser && (
        <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            Create Booking Request
          </h2>
          <form
            onSubmit={submitBooking}
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <select
              className="input-field md:col-span-2"
              value={form.resourceId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, resourceId: e.target.value }))
              }
              required
            >
              <option value="">Select Resource</option>
              {resources
                .filter(
                  (resource) =>
                    resource.status === "ACTIVE" && resource.availability,
                )
                .map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location} ({resource.capacity})
                  </option>
                ))}
            </select>
            <input
              className="input-field"
              type="date"
              value={form.bookingDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bookingDate: e.target.value }))
              }
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="input-field"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
                required
              />
              <input
                className="input-field"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                required
              />
            </div>
            <input
              className="input-field md:col-span-2 w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
              placeholder="Purpose of booking"
              value={form.purpose}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, purpose: e.target.value }))
              }
              required
            />
            <button type="submit" className="primary-btn md:col-span-2">
              Submit Booking
            </button>
          </form>
        </section>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100 mb-6">
          {isAdmin ? "Booking Requests" : "My Bookings"}
        </h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:border-white/10 dark:bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-left font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
                  <th className="px-5 py-4">Resource</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Purpose</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{booking.resourceName}</td>
                  <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">{booking.bookingDate}</td>
                  <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">{booking.purpose}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${badgeClass[booking.status] || "bg-slate-200 text-slate-700"}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isAdmin && booking.status === "PENDING" && (
                      <div className="space-y-2">
                        <input
                          className="w-full rounded-lg border border-slate-200/60 bg-white/50 px-3 py-1.5 text-xs outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200"
                          placeholder="Reason"
                          value={decisionReason[booking.id] || ""}
                          onChange={(e) =>
                            setDecisionReason((prev) => ({
                              ...prev,
                              [booking.id]: e.target.value,
                            }))
                          }
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-white shadow-sm hover:bg-emerald-600"
                            onClick={() =>
                              handleDecision(booking.id, "approve")
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-rose-500 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-white shadow-sm hover:bg-rose-600"
                            onClick={() => handleDecision(booking.id, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {!isAdmin &&
                      ["PENDING", "APPROVED"].includes(booking.status) && (
                        <button
                          type="button"
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center font-medium text-slate-500"
                  >
                    No bookings found.
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

export default BookingsPage;
