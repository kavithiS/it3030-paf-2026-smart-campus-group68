import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { normalizeRoles, useAuth } from "../context/AuthContext";
import {
  getPrimaryRole,
  getRoleAccent,
  getSidebarItems,
} from "../utils/dashboardConfig";

const NotificationsPage = () => {
  const { user, logout } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const primaryRole = getPrimaryRole(roles);
  const accent = getRoleAccent(primaryRole);
  const sidebarItems = useMemo(
    () => getSidebarItems(primaryRole),
    [primaryRole],
  );

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const isRead = (item) => item.status === "READ" || item.read === true;

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications", {
        params: { page: 0, size: 100 },
      });
      setNotifications(res.data?.content || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true, status: "READ" } : item,
        ),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update notification.",
      );
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true, status: "READ" })),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update notifications.",
      );
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Notifications"
      items={sidebarItems}
      displayRole={primaryRole}
      {...accent}
    >
      <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
            Activity Notifications
          </h2>
          <button
            type="button"
            className="rounded-xl border border-slate-300/80 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-white/20 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {notifications.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                isRead(item)
                  ? "border-white/60 bg-white/60 dark:border-white/10 dark:bg-slate-950/60"
                  : "border-indigo-100 bg-indigo-50/80 dark:border-indigo-500/20 dark:bg-indigo-900/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[0.95rem] font-extrabold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {item.createdAt}
                  </p>
                </div>
                {!isRead(item) && (
                  <button
                    type="button"
                    onClick={() => markRead(item.id)}
                    className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:shadow dark:border-indigo-500/30 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </article>
          ))}
          {notifications.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-200/80 rounded-3xl bg-white/30 dark:bg-slate-900/30 dark:border-white/5">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4 dark:bg-slate-800">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No new notifications.
              </p>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default NotificationsPage;
