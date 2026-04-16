import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const RoleDashboardLayout = ({
  user,
  logout,
  title,
  items,
  children,
  displayRole,
  accentClassName,
  accentButtonClassName,
  accentTextClassName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState(
    items?.[0]?.key || "dashboard",
  );

  useEffect(() => {
    const activeItem = items.find((item) => item.route === location.pathname);
    if (activeItem) {
      setActiveMenuKey(activeItem.key);
    }
  }, [items, location.pathname]);

  const handleNavigate = (item) => {
    setActiveMenuKey(item.key);
    if (item.route) {
      navigate(item.route);
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        items={items}
        activeKey={activeMenuKey}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        displayRole={displayRole}
        accentClassName={accentClassName}
        accentButtonClassName={accentButtonClassName}
        accentTextClassName={accentTextClassName}
        onLogout={logout}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title={title}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleDashboardLayout;
