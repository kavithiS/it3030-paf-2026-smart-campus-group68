import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  getLandingRoute,
  normalizeRoles,
  useAuth,
} from "../context/AuthContext";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef(null);

  const roles = useMemo(() => normalizeRoles(user?.roles), [user?.roles]);

  useEffect(() => {
    if (!token) return;

    const loadUnread = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnread(res.data?.unread || 0);
      } catch (error) {
        console.error("Failed to load unread notifications", error);
      }
    };

    loadUnread();
  }, [token]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications", {
        params: { page: 0, size: 6 },
      });
      setItems(res.data?.content || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true, status: "READ" } : item,
        ),
      );
      setUnread((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const resolveDestination = (item) => {
    const query = item.referenceId ? `?id=${item.referenceId}` : "";
    const ticketQuery = item.referenceId ? `?ticketId=${item.referenceId}` : "";

    if (item.referenceType === "BOOKING") {
      return roles.includes("TECHNICIAN")
        ? getLandingRoute(roles)
        : `/bookings${query}`;
    }

    if (item.referenceType === "TICKET" || item.type?.startsWith("TICKET")) {
      return `/tickets${ticketQuery}`;
    }

    return "/notifications";
  };

  const isRead = (item) => item.status === "READ" || item.read === true;

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications();
    }
  };

  const handleItemClick = async (item) => {
    if (!isRead(item)) {
      await markAsRead(item.id);
    }
    setOpen(false);
    navigate(resolveDestination(item));
  };

  if (!token) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-3 text-sm text-slate-500">Loading...</p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-500">
                No notifications yet.
              </p>
            )}
            {!loading &&
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                    isRead(item) ? "opacity-75" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {item.message}
                  </p>
                </button>
              ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
