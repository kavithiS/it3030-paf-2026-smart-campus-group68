import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const accents = {
  USER: {
    accentClassName: "bg-gradient-to-r from-blue-600 to-indigo-600",
    accentButtonClassName: "bg-gradient-to-r from-blue-600 to-indigo-600",
    accentTextClassName: "text-blue-200",
  },
  ADMIN: {
    accentClassName: "bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]",
    accentButtonClassName: "bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]",
    accentTextClassName: "text-indigo-200",
  },
  TECHNICIAN: {
    accentClassName: "bg-gradient-to-r from-indigo-600 to-blue-600",
    accentButtonClassName: "bg-gradient-to-r from-indigo-600 to-blue-600",
    accentTextClassName: "text-indigo-200",
  },
};

const dashboardRoutes = {
  USER: "/user-dashboard",
  ADMIN: "/admin-dashboard",
  TECHNICIAN: "/technician-dashboard",
};

export const getPrimaryRole = (roles = []) => {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("TECHNICIAN")) return "TECHNICIAN";
  return "USER";
};

export const getRoleAccent = (role) => accents[role] || accents.USER;

export const getSidebarItems = (role) => {
  const dashboardRoute = dashboardRoutes[role] || dashboardRoutes.USER;

  const common = [
    {
      key: "resources",
      label: "Facilities",
      icon: LayoutGrid,
      route: "/resources",
    },
    { key: "tickets", label: "Tickets", icon: Wrench, route: "/tickets" },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
      route: "/notifications",
    },
  ];

  if (role === "ADMIN") {
    return [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: ShieldCheck,
        route: dashboardRoute,
      },
      {
        key: "bookings",
        label: "Bookings",
        icon: CalendarDays,
        route: "/bookings",
      },
      ...common,
    ];
  }

  if (role === "TECHNICIAN") {
    return [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: ClipboardList,
        route: dashboardRoute,
      },
      ...common,
    ];
  }

  return [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: ClipboardList,
      route: dashboardRoute,
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: CalendarDays,
      route: "/bookings",
    },
    ...common,
  ];
};
