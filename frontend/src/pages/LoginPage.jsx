import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { LogIn, UserPlus, Fingerprint, Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains("dark") ? "dark" : "light";

    root.classList.remove("light", "dark");
    root.classList.add("light");

    return () => {
      const savedTheme = localStorage.getItem("theme");
      const restoredTheme =
        savedTheme === "dark" || savedTheme === "light"
          ? savedTheme
          : previousTheme;

      root.classList.remove("light", "dark");
      root.classList.add(restoredTheme);
    };
  }, []);

  let submitLabel = "Sign In";
  if (isSubmitting) {
    submitLabel = "Please wait...";
  } else if (isRegisterMode) {
    submitLabel = "Create Account";
  }
  const hasAuthAlert = Boolean(error || success);

  const switchAuthMode = (registerMode) => {
    setIsRegisterMode(registerMode);
    setError(null);
    setSuccess(null);

    if (!registerMode) {
      setName("");
      setConfirmPassword("");
    }
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);

    if (isRegisterMode && password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await api.post("/auth/register", { name, email, password });
        setSuccess("Registration successful! Please login.");
        setIsRegisterMode(false);
      } else {
        const { data } = await api.post("/auth/login", { email, password });
        loginUser(data.token, {
          id: data.id,
          name: data.name,
          email: data.email,
          roles: data.roles,
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please ensure backend is running on port 8080.",
        );
        return;
      }

      if (err.response?.status === 503) {
        setError(
          "Authentication service is temporarily unavailable. Please check backend database connectivity and try again.",
        );
        return;
      }

      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page h-[100dvh] overflow-hidden p-3 sm:p-4 md:p-5">
      <div className="auth-shell mx-auto grid h-full w-full max-w-6xl overflow-hidden rounded-2xl glass-card xl:grid-cols-2 xl:rounded-3xl">
        <section className="auth-hero relative hidden overflow-hidden bg-slate-950 p-8 text-white xl:block">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/35 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              UniReserveHub
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">
              Manage Resources, Bookings, and Incidents in One Place
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Securely sign in to manage bookings, track incidents, and stay
              updated across campus operations.
            </p>
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Facilities & Asset Catalogue
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Workflow-based Booking System
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Maintenance & Incident Ticketing
              </div>
            </div>
          </div>
        </section>

        <section
          className={`auth-form-panel flex h-full items-center justify-center overflow-hidden bg-white px-5 sm:px-7 ${
            isRegisterMode ? "py-4 sm:py-5" : "py-2.5 sm:py-3"
          }`}
        >
          <div
            className={`auth-form-content mx-auto w-full max-w-md animate-fade-up ${
              isRegisterMode ? "register-mode" : ""
            } ${isRegisterMode && hasAuthAlert ? "with-alert-message" : ""}`}
          >
            <div
              className={`flex justify-center ${
                isRegisterMode ? "mb-2 sm:mb-3" : "mb-4 sm:mb-5"
              }`}
            >
              <div
                className={`rounded-2xl bg-teal-700 shadow-lg shadow-teal-800/20 ${
                  isRegisterMode ? "p-2.5" : "p-3"
                }`}
              >
                <Fingerprint className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2
              className={`text-center font-extrabold text-slate-900 ${
                isRegisterMode
                  ? "mb-0.5 text-xl sm:text-2xl"
                  : "mb-1 text-2xl sm:text-3xl"
              }`}
            >
              UniReserveHub
            </h2>
            <p
              className={`text-center text-sm text-slate-500 ${
                isRegisterMode ? "mb-3.5 sm:mb-4" : "mb-5 sm:mb-6"
              }`}
            >
              {isRegisterMode
                ? "Create a new account"
                : "Sign in to your account"}
            </p>

            {error && (
              <div className="mb-4 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-600 sm:text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700 sm:text-sm">
                {success}
              </div>
            )}

            <form
              onSubmit={handleManualAuth}
              className={
                isRegisterMode
                  ? "space-y-3 sm:space-y-3.5"
                  : "space-y-3.5 sm:space-y-4"
              }
            >
              {isRegisterMode && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Dhanaja V Kulathunga"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 transition hover:text-teal-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 transition hover:text-teal-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="primary-btn mt-1 w-full space-x-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegisterMode ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span>{submitLabel}</span>
              </button>
            </form>

            <div
              className={`flex items-center justify-between ${
                isRegisterMode ? "mt-3.5 sm:mt-4" : "mt-5 sm:mt-6"
              }`}
            >
              <span className="w-1/5 border-b border-slate-200 md:w-1/4" />
              <span className="text-center text-xs uppercase tracking-[0.14em] text-slate-400">
                Or continue with
              </span>
              <span className="w-1/5 border-b border-slate-200 md:w-1/4" />
            </div>

            <div className={isRegisterMode ? "mt-3 sm:mt-4" : "mt-4 sm:mt-5"}>
              <GoogleAuthButton />
            </div>

            <div
              className={`border-t border-slate-200 text-center text-sm ${
                isRegisterMode ? "mt-3.5 pt-3" : "mt-5 pt-4"
              }`}
            >
              <p className="text-slate-500">
                {isRegisterMode
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <button
                  onClick={() => switchAuthMode(!isRegisterMode)}
                  className="font-semibold text-teal-700 transition hover:text-teal-600"
                >
                  {isRegisterMode ? "Sign in" : "Register now"}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
