import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import OAuthSuccess from "./pages/OAuthSuccess";
import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import {
  decodeJwtPayload,
  getLandingRoute,
  normalizeRoles,
  useAuth,
} from "./context/AuthContext";

function App() {
  const { token, user, loading } = useAuth();
  const tokenRoles = token ? decodeJwtPayload(token)?.roles : [];
  const effectiveRoles = user?.roles || normalizeRoles(tokenRoles);
  const defaultRoute = token ? getLandingRoute(effectiveRoles) : "/";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <Routes>
        <Route path="/" element={token ? <Navigate to={defaultRoute} replace /> : <LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route
            path="/dashboard"
            element={<Navigate to="/user-dashboard" replace />}
          />
        </Route>

        {/* Role Specific Protect Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
          <Route
            path="/technician-dashboard"
            element={<TechnicianDashboard />}
          />
        </Route>

        <Route
          path="/unauthorized"
          element={
            <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
              <div className="glass-card animate-fade-up w-full rounded-3xl p-8 text-center">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                  Access denied
                </p>
                <h1 className="mb-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  Unauthorized access
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your account does not have permission to view this page.
                </p>
              </div>
            </div>
          }
        />

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </div>
  );
}

export default App;
