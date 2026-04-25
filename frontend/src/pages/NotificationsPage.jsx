import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  CheckCircle,
  Bell,
  Calendar,
  Ticket,
  MessageSquare,
} from "lucide-react";
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
  const navigate = useNavigate();
  const roles = normalizeRoles(user?.roles);
  const primaryRole = getPrimaryRole(roles);
  const accent = getRoleAccent(primaryRole);
  const sidebarItems = useMemo(
    () => getSidebarItems(primaryRole),
    [primaryRole],
  );

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [isClearing, setIsClearing] = useState(false);

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

  const clearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to clear notifications.",
      );
    } finally {
      setIsClearing(false);
    }
  };

  const unreadNotifications = notifications.filter((item) => !isRead(item));
  const readNotifications = notifications.filter((item) => isRead(item));

  const handleNotificationClick = async (item) => {
    if (!isRead(item)) {
      await markRead(item.id);
    }

    const query = item.referenceId ? `?id=${item.referenceId}` : "";
    const ticketQuery = item.referenceId ? `?ticketId=${item.referenceId}` : "";

    if (item.referenceType === "BOOKING") {
      navigate(`/bookings${query}`);
    } else if (
      item.referenceType === "TICKET" ||
      item.type?.startsWith("TICKET")
    ) {
      navigate(`/tickets${ticketQuery}`);
    }
  };

  const getIcon = (type) => {
    if (type?.startsWith("BOOKING"))
      return <Calendar className="h-5 w-5 text-indigo-500" />;
    if (type?.startsWith("TICKET")) {
      if (type === "TICKET_COMMENT_ADDED")
        return <MessageSquare className="h-5 w-5 text-emerald-500" />;
      return <Ticket className="h-5 w-5 text-amber-500" />;
    }
    return <Bell className="h-5 w-5 text-slate-400" />;
  };

  const NotificationItem = ({ item }) => (
    <article
      key={item.id}
      onClick={() => handleNotificationClick(item)}
      className={`group relative rounded-2xl border p-5 transition-all duration-500 cursor-pointer hover:shadow-lg active:scale-[0.99] animate-fade-up ${
        isRead(item)
          ? "border-slate-100 bg-white/40 dark:border-white/5 dark:bg-slate-950/20 opacity-80"
          : "border-indigo-100 bg-indigo-50/50 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-900/10"
      }`}
    >
      {!isRead(item) && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 rounded-xl p-3 ${isRead(item) ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900"} shadow-sm transition-transform duration-300 group-hover:scale-110`}
        >
          {getIcon(item.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className={`text-[0.95rem] font-bold tracking-tight ${isRead(item) ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
            >
              {item.title}
            </h3>
            {!isRead(item) && (
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse"></span>
            )}
          </div>
          <p
            className={`text-sm font-medium leading-relaxed ${isRead(item) ? "text-slate-500 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}
          >
            {item.message}
          </p>
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Bell className="h-3 w-3" />
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {!isRead(item) && (
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-indigo-400 hover:text-indigo-600 transition-colors shadow-sm"
              title="Mark as read"
              onClick={(e) => {
                e.stopPropagation();
                markRead(item.id);
              }}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
              Notifications
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your latest system activities
            </p>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                  onClick={markAllRead}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
                <button
                  type="button"
                  disabled={isClearing}
                  className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-2 text-xs font-bold text-rose-600 shadow-sm backdrop-blur transition-all duration-300 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200 dark:border-rose-500/10 dark:bg-rose-500/5 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isClearing ? "Clearing..." : "Clear All"}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            {error}
          </div>
        )}

        <div className="space-y-10">
          {/* New Notifications */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              New Notifications ({unreadNotifications.length})
            </h3>
            <div className="space-y-3">
              {unreadNotifications.map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
              {unreadNotifications.length === 0 && (
                <p className="py-6 text-center text-sm font-medium text-slate-400 border border-dashed border-slate-200 rounded-2xl dark:border-white/5">
                  No new notifications.
                </p>
              )}
            </div>
          </div>

          {/* Earlier Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                Earlier Notifications
              </h3>
              <div className="space-y-3">
                {readNotifications.map((item) => (
                  <NotificationItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {notifications.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200/60 rounded-[2.5rem] bg-white/20 dark:bg-slate-900/20 dark:border-white/5">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800 mb-6 shadow-sm">
                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                No notifications yet
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                When you have updates, they'll appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default NotificationsPage;
