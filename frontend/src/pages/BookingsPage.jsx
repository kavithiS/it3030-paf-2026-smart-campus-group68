import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { normalizeRoles, useAuth } from "../context/AuthContext";
import {
  getPrimaryRole,
  getRoleAccent,
  getSidebarItems,
} from "../utils/dashboardConfig";

const STATUS_BADGE = {
  PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  CANCELLED: "bg-slate-200 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400",
};

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const emptyForm = {
  resourceId: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  attendees: "",
};

const today = () => new Date().toISOString().split("T")[0];

const BookingsPage = () => {
  const { user, logout } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const isUser       = roles.includes("USER");
  const isAdmin      = roles.includes("ADMIN");
  const isTechnician = roles.includes("TECHNICIAN");
  const canViewAll   = isAdmin || isTechnician;
  const primaryRole  = getPrimaryRole(roles);
  const accent       = getRoleAccent(primaryRole);
  const sidebarItems = useMemo(() => getSidebarItems(primaryRole), [primaryRole]);

  const [resources, setResources]         = useState([]);
  const [bookings, setBookings]           = useState([]);
  const [statusFilter, setStatusFilter]   = useState("ALL");
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState("");
  const [decisionReason, setDecisionReason] = useState({});
  const [reasonError, setReasonError]     = useState({});
  const [form, setForm]                   = useState(emptyForm);
  const [formErrors, setFormErrors]       = useState({});
  const [submitting, setSubmitting]       = useState(false);

  const loadResources = async () => {
    try {
      const res = await api.get("/resources", { params: { page: 0, size: 100 } });
      setResources(res.data?.content || []);
    } catch {
      setError("Failed to load resources.");
    }
  };

  const loadBookings = async (filter = statusFilter) => {
    try {
      const endpoint = canViewAll ? "/bookings" : "/bookings/mine";
      const params = { page: 0, size: 50 };
      if (filter !== "ALL") params.status = filter;
      const res = await api.get(endpoint, { params });
      setBookings(res.data?.content || []);
    } catch {
      setError("Failed to load bookings.");
    }
  };

  const [highlightedBookingId, setHighlightedBookingId] = useState(null);

  useEffect(() => {
    loadResources();
    loadBookings();
    
    // Handle highlight from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setHighlightedBookingId(id);
      // Remove param from URL
      window.history.replaceState({}, "", window.location.pathname);
      // Clear highlight after 5 seconds
      setTimeout(() => setHighlightedBookingId(null), 5000);
    }
  }, [canViewAll]);

  useEffect(() => {
    if (highlightedBookingId && bookings.length > 0) {
      const el = document.getElementById(`booking-${highlightedBookingId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedBookingId, bookings]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.resourceId) errors.resourceId = "Please select a resource.";
    if (!form.bookingDate) {
      errors.bookingDate = "Please select a date.";
    } else if (form.bookingDate < today()) {
      errors.bookingDate = "Date cannot be in the past.";
    }
    if (!form.startTime) errors.startTime = "Start time is required.";
    if (!form.endTime) {
      errors.endTime = "End time is required.";
    } else if (form.startTime && form.endTime <= form.startTime) {
      errors.endTime = "End time must be after start time.";
    }
    if (!form.purpose.trim()) errors.purpose = "Purpose is required.";
    if (form.attendees !== "" && Number(form.attendees) < 1) {
      errors.attendees = "Attendees must be at least 1.";
    }
    return errors;
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      const payload = {
        resourceId: form.resourceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
      };
      if (form.attendees !== "") payload.attendees = Number(form.attendees);
      await api.post("/bookings", payload);
      setForm(emptyForm);
      flash("Booking request submitted successfully.");
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id, action) => {
    const reason = decisionReason[id]?.trim();
    if (!reason) {
      setReasonError((prev) => ({ ...prev, [id]: "A reason is required." }));
      return;
    }
    setReasonError((prev) => ({ ...prev, [id]: "" }));
    try {
      await api.patch(`/bookings/${id}/${action}`, { reason });
      flash(`Booking ${action === "approve" ? "approved" : "rejected"}.`);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} booking.`);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      flash("Booking cancelled.");
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const onStatusFilterChange = (val) => {
    setStatusFilter(val);
    loadBookings(val);
  };

  const fieldClass = (err) =>
    `w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:ring-2 [color-scheme:light] dark:[color-scheme:dark] dark:bg-slate-900/50 dark:text-slate-200 ${
      err
        ? "border-rose-400 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/40 dark:bg-rose-900/10"
        : "border-slate-200/60 bg-white/50 focus:border-indigo-400 focus:bg-white focus:ring-indigo-100 dark:border-white/10 dark:focus:border-indigo-500"
    }`;

  if (!user) return null;

  const activeResources = resources.filter(
    (r) => r.status === "ACTIVE" && r.availability
  );

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Booking Management"
      items={sidebarItems}
      displayRole={primaryRole}
      {...accent}
    >
      {/* Success banner */}
      {success && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-900/20 dark:text-rose-400">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
          <button
            type="button"
            className="ml-auto text-xs underline"
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Booking form — users only */}
      {isUser && (
        <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 mb-6">
          <h2 className="mb-5 text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            Create Booking Request
          </h2>

          <form onSubmit={submitBooking} noValidate className="grid gap-4 md:grid-cols-2">
            {/* Resource */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resource *
              </label>
              <select
                className={fieldClass(formErrors.resourceId)}
                value={form.resourceId}
                onChange={(e) => setForm((p) => ({ ...p, resourceId: e.target.value }))}
              >
                <option value="">Select a resource…</option>
                {activeResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.location} (capacity: {r.capacity})
                  </option>
                ))}
              </select>
              {formErrors.resourceId && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.resourceId}</p>
              )}
              {activeResources.length === 0 && (
                <p className="mt-1 text-xs text-amber-500">No resources are currently available.</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                Date *
              </label>
              <input
                type="date"
                min={today()}
                className={fieldClass(formErrors.bookingDate)}
                value={form.bookingDate}
                onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))}
              />
              {formErrors.bookingDate && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.bookingDate}</p>
              )}
            </div>

            {/* Attendees */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                Expected Attendees
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 30"
                className={fieldClass(formErrors.attendees)}
                value={form.attendees}
                onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
              />
              {formErrors.attendees && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.attendees}</p>
              )}
            </div>

            {/* Time range */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Time Range *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="time"
                    className={fieldClass(formErrors.startTime)}
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  />
                  {formErrors.startTime && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.startTime}</p>
                  )}
                </div>
                <div>
                  <input
                    type="time"
                    className={fieldClass(formErrors.endTime)}
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  />
                  {formErrors.endTime && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Purpose *
              </label>
              <input
                type="text"
                placeholder="Briefly describe the purpose of this booking…"
                className={fieldClass(formErrors.purpose)}
                value={form.purpose}
                onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                maxLength={200}
              />
              {formErrors.purpose && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.purpose}</p>
              )}
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 pt-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Bookings are subject to admin approval.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Technician info banner */}
      {isTechnician && (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/60 px-5 py-3 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-900/20 dark:text-violet-400">
          As a technician you have read-only access to all bookings. Use this to plan maintenance around upcoming reservations.
        </div>
      )}

      {/* Bookings table */}
      <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            {canViewAll ? "All Bookings" : "My Bookings"}
          </h2>

          {/* Status filter — visible for everyone */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusFilterChange(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? "bg-slate-900 text-white shadow dark:bg-slate-100 dark:text-slate-900"
                    : "border border-slate-200/60 bg-white/60 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:border-white/10 dark:bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-left font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
                  <th className="px-5 py-4">Resource</th>
                  {canViewAll && <th className="px-5 py-4">Requested By</th>}
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Purpose</th>
                  <th className="px-5 py-4">Attendees</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    id={`booking-${booking.id}`}
                    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                      highlightedBookingId === booking.id ? "animate-highlight" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {booking.resourceName}
                    </td>
                    {canViewAll && (
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                        {booking.userName}
                      </td>
                    )}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {booking.bookingDate}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {booking.startTime} – {booking.endTime}
                    </td>
                    <td className="px-5 py-4 max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={booking.purpose}>
                      {booking.purpose}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {booking.attendees ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${STATUS_BADGE[booking.status] || "bg-slate-200 text-slate-600"}`}>
                          {booking.status}
                        </span>
                        {booking.decisionReason && (
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 italic max-w-[140px] truncate" title={booking.decisionReason}>
                            {booking.decisionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[180px]">
                      {/* Admin: approve / reject pending bookings */}
                      {isAdmin && booking.status === "PENDING" && (
                        <div className="space-y-2">
                          <input
                            className="w-full rounded-lg border border-slate-200/60 bg-white/50 px-3 py-1.5 text-xs outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200"
                            placeholder="Reason (required)"
                            value={decisionReason[booking.id] || ""}
                            onChange={(e) =>
                              setDecisionReason((p) => ({ ...p, [booking.id]: e.target.value }))
                            }
                          />
                          {reasonError[booking.id] && (
                            <p className="text-[11px] text-rose-500">{reasonError[booking.id]}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-white shadow-sm hover:bg-emerald-600"
                              onClick={() => handleDecision(booking.id, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="flex-1 rounded-lg bg-rose-500 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-white shadow-sm hover:bg-rose-600"
                              onClick={() => handleDecision(booking.id, "reject")}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* User: cancel own pending/approved bookings */}
                      {isUser && !isAdmin && !isTechnician &&
                        ["PENDING", "APPROVED"].includes(booking.status) && (
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        )}

                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={canViewAll ? 8 : 7}
                      className="px-5 py-12 text-center font-medium text-slate-400"
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
