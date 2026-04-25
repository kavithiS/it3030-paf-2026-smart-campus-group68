import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { normalizeRoles, useAuth } from "../context/AuthContext";
import {
  getPrimaryRole,
  getRoleAccent,
  getSidebarItems,
} from "../utils/dashboardConfig";

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

const statusClass = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const TicketsPage = () => {
  const { user, logout } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const isUser = roles.includes("USER");
  const isAdmin = roles.includes("ADMIN");
  const isTechnician = roles.includes("TECHNICIAN");
  const primaryRole = getPrimaryRole(roles);
  const accent = getRoleAccent(primaryRole);

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    description: "",
    priority: "MEDIUM",
    images: [],
  });

  const sidebarItems = useMemo(
    () => getSidebarItems(primaryRole),
    [primaryRole],
  );

  const getEndpoint = () => {
    if (isAdmin) return "/tickets";
    if (isTechnician) return "/tickets/assigned";
    return "/tickets/mine";
  };

  const loadTickets = async () => {
    try {
      const res = await api.get(getEndpoint(), {
        params: { page: 0, size: 50 },
      });
      const content = res.data?.content || [];
      setTickets(content);
      if (selectedTicket) {
        const refreshed = content.find((item) => item.id === selectedTicket.id);
        if (refreshed) {
          setSelectedTicket(refreshed);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tickets.");
    }
  };

  const loadTechnicians = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get("/users");
      setTechnicians(
        (res.data || []).filter((u) => (u.roles || []).includes("TECHNICIAN")),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load technicians.");
    }
  };

  useEffect(() => {
    loadTickets();
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isTechnician]);

  const handleImages = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 3);
    const encoded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setForm((prev) => ({ ...prev, images: encoded }));
  };

  const createTicket = async (event) => {
    event.preventDefault();
    try {
      await api.post("/tickets", form);
      setForm({
        category: "",
        description: "",
        priority: "MEDIUM",
        images: [],
      });
      await loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create ticket.");
    }
  };

  const assignTechnician = async (ticketId, technicianId) => {
    if (!technicianId) return;
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { technicianId });
      await loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to assign technician.");
    }
  };

  const updateStatus = async (ticketId, status, resolutionNotes = "") => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, {
        status,
        resolutionNotes,
      });
      await loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
    }
  };

  const addComment = async () => {
    if (!selectedTicket || !comment.trim()) return;
    try {
      const res = await api.post(`/tickets/${selectedTicket.id}/comments`, {
        message: comment,
      });
      setSelectedTicket(res.data);
      setComment("");
      await loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment.");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Maintenance & Incident Ticketing"
      items={sidebarItems}
      displayRole={primaryRole}
      {...accent}
    >
      {isUser && (
        <section className="animate-fade-up mb-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Create Ticket
          </h2>
          <form
            onSubmit={createTicket}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <input
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              required
            />
            <select
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
              value={form.priority}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <textarea
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500 md:col-span-2"
              rows={4}
              placeholder="Describe the incident"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Upload up to 3 images
              </label>
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="primary-btn md:col-span-2">
              Submit Ticket
            </button>
          </form>
        </section>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isAdmin
              ? "All Tickets"
              : isTechnician
                ? "Assigned Tickets"
                : "My Tickets"}
          </h2>
          <div className="mt-6 space-y-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-950/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      {ticket.category}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">#{ticket.id}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${statusClass[ticket.status] || "bg-slate-200 text-slate-700"}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {ticket.description}
                </p>
                <p className="mt-2 inline-flex items-center rounded-lg bg-slate-200/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                  Priority: {ticket.priority}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Open Comments
                  </button>

                  {isAdmin && (
                    <select
                      className="rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-indigo-500"
                      value=""
                      onChange={(e) =>
                        assignTechnician(ticket.id, e.target.value)
                      }
                    >
                      <option value="">Assign technician</option>
                      {technicians.map((tech) => (
                         <option key={tech.id} value={tech.id} className="font-semibold text-sm">
                          {tech.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {(isTechnician || isAdmin) && (
                    <select
                      className="rounded-xl border border-slate-300/80 bg-white/50 px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-indigo-500"
                      value={ticket.status}
                      onChange={(e) =>
                        updateStatus(
                          ticket.id,
                          e.target.value,
                          ticket.resolutionNotes || "",
                        )
                      }
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option} className="font-semibold text-sm">
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </article>
            ))}
            {tickets.length === 0 && (
              <p className="text-sm text-slate-500">No tickets found.</p>
            )}
          </div>
        </div>

        <aside className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md h-fit sticky top-24 dark:border-white/10 dark:bg-slate-900/40">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Comments
          </h3>
          {!selectedTicket && (
            <div className="mt-6 flex flex-col items-center justify-center p-8 border border-dashed border-slate-300/80 rounded-2xl bg-white/30 dark:bg-slate-900/30 dark:border-white/10">
              <p className="text-sm font-medium text-slate-500 text-center">
                Select a ticket to view comments.
              </p>
            </div>
          )}

          {selectedTicket && (
            <>
              <p className="mt-3 text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {selectedTicket.category}
              </p>
              <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {(selectedTicket.comments || []).map((item) => (
                  <div
                    key={item.commentId}
                    className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {item.authorName}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.message}
                    </p>
                  </div>
                ))}
                {(selectedTicket.comments || []).length === 0 && (
                  <p className="text-sm font-medium text-slate-500 p-4 text-center">No comments yet.</p>
                )}
              </div>

              <div className="mt-5 space-y-3 pt-5 border-t border-slate-200/50 dark:border-white/5">
                <textarea
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                  rows={3}
                  placeholder="Add a new comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  onClick={addComment}
                >
                  Post Comment
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </DashboardLayout>
  );
};

export default TicketsPage;
