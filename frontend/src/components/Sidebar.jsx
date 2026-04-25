import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, ShieldCheck } from "lucide-react";

const Sidebar = ({
  items,
  activeKey,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  user,
  displayRole,
  accentClassName = "bg-gradient-to-br from-indigo-500 to-blue-600",
  accentButtonClassName = "bg-gradient-to-r from-indigo-500 to-blue-600",
  accentTextClassName = "text-slate-400",
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef(null);
  const derivedRole = user?.roles?.[0] || "USER";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileContainerRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isProfileOpen]);

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r bg-white/80 border-slate-200 text-slate-700 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100 lg:static lg:z-10 lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-24" : "w-72"}`}
      >
        <div className="flex h-20 items-center border-b border-slate-200 px-4 dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg ${accentClassName}`}
            >
              <ShieldCheck className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
                  UniReserveHub
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Operations Suite</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="absolute -right-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <nav className="space-y-2 px-3 py-4">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.key}
                onClick={() => onNavigate(item)}
                className={`group flex w-full items-center rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? `${accentButtonClassName} text-white shadow-md`
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${!isCollapsed ? "mr-3" : "mx-auto"}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div
          ref={profileContainerRef}
          className="absolute bottom-0 left-0 w-full border-t border-slate-200 bg-white/80 p-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80"
        >
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/50"
            aria-label="Open profile menu"
          >
            <div
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${accentClassName}`}
            >
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user.name}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400`}
                >
                  {displayRole || derivedRole}
                </p>
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div
              className={`absolute bottom-[4.25rem] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 ${
                isCollapsed ? "left-[5.75rem] w-56" : "left-3 right-3"
              }`}
            >
              <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user.name}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
