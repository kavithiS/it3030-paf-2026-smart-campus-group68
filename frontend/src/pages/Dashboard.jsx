import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck2, ShieldAlert } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState("dashboard");

  if (!user) return null;

  const roles = user.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isTechnician = roles.includes("TECHNICIAN");
  const primaryRole = isAdmin ? "ADMIN" : isTechnician ? "TECHNICIAN" : "USER";

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/dashboard",
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: "Admin Panel",
            icon: ShieldAlert,
            route: "/admin",
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setActiveMenuKey("dashboard");
    } else if (location.pathname === "/admin") {
      setActiveMenuKey("admin");
    }
  }, [location.pathname]);

  const handleNavigate = (item) => {
    setActiveMenuKey(item.key);

    if (item.route) {
      navigate(item.route);
      setIsMobileSidebarOpen(false);
      return;
    }

    if (item.section) {
      const sectionElement = document.getElementById(item.section);
      sectionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileSidebarOpen(false);
    }
  };

  const roleBadgeClass =
    primaryRole === "ADMIN"
      ? "bg-amber-100 text-amber-700"
      : primaryRole === "TECHNICIAN"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-indigo-100 text-indigo-700";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        items={sidebarItems}
        activeKey={activeMenuKey}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        onLogout={logout}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-7 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                UniReserveHub
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Welcome back, {user.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleBadgeClass}`}
                >
                  {primaryRole}
                </span>
                <p className="text-sm text-indigo-100">
                  Monitor bookings, resources, maintenance, and service requests
                  in one place.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
