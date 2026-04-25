import React, { useState, useEffect } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onMenuClick, title = "Dashboard" }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show if scrolling up, hide if scrolling down
      // But always show if at the very top (less than 10px)
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-xl transition-all duration-500 ease-in-out dark:border-white/10 dark:bg-slate-950/80 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/60 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight transition-colors duration-300 dark:text-slate-100 drop-shadow-sm">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationBell />
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 rotate-0 transition-transform duration-300" />
          ) : (
            <Moon className="h-5 w-5 rotate-0 transition-transform duration-300" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
