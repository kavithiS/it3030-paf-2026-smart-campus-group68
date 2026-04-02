import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import OAuthSuccess from "./pages/OAuthSuccess";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Role Specific Protect Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin"
            element={
              <div className="mx-auto max-w-5xl px-4 py-10">
                <div className="soft-card rounded-2xl p-8 text-slate-700 transition-colors duration-300 dark:text-slate-200">
                  Admin panel container
                </div>
              </div>
            }
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
      </Routes>
    </div>
  );
}

export default App;
