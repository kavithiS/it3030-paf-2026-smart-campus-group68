import React, { useEffect, useState } from "react";
import {
  decodeJwtPayload,
  getLandingRouteFromToken,
  useAuth,
} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { LogIn, UserPlus, Fingerprint, Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";
import RoleSelector from "../components/RoleSelector";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const ADMIN_EMAIL_PATTERN = /^admin.*@urh\.com$/i;
const TECH_EMAIL_PATTERN = /^tech.*@urh\.com$/i;
const USER_FORBIDDEN_PREFIX_PATTERN = /^(admin|tech).*/i;
const USER_FORBIDDEN_DOMAIN_PATTERN = /@urh\.com$/i;

const REGISTER_ROLE_THEME = {
  USER: {
    iconBg: "bg-blue-600",
    iconShadow: "shadow-blue-700/25",
    selectorActive: "from-blue-600 to-indigo-600",
    selectorShadow: "shadow-blue-200",
    selectorRing: "ring-blue-500",
    buttonGradient: "from-blue-600 to-indigo-600",
    buttonShadow: "shadow-blue-700/45",
    hoverText: "hover:text-blue-600",
    linkText: "text-blue-700 hover:text-blue-600",
    successBox: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ADMIN: {
    iconBg: "bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]",
    iconShadow: "shadow-indigo-950/30",
    selectorActive: "from-[#1E2A50] to-[#3B4A89]",
    selectorShadow: "shadow-indigo-300/40",
    selectorRing: "ring-indigo-700",
    buttonGradient: "from-[#1E2A50] to-[#3B4A89]",
    buttonShadow: "shadow-indigo-950/45",
    hoverText: "hover:text-indigo-700",
    linkText: "text-indigo-700 hover:text-indigo-600",
    successBox: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  TECHNICIAN: {
    iconBg: "bg-gradient-to-r from-[#0F4C5C] to-[#176D7A]",
    iconShadow: "shadow-cyan-950/30",
    selectorActive: "from-[#0F4C5C] to-[#176D7A]",
    selectorShadow: "shadow-cyan-300/40",
    selectorRing: "ring-cyan-700",
    buttonGradient: "from-[#0F4C5C] to-[#176D7A]",
    buttonShadow: "shadow-cyan-950/45",
    hoverText: "hover:text-cyan-700",
    linkText: "text-cyan-700 hover:text-cyan-600",
    successBox: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
};

const validateEmailByRole = (role, email) => {
  if (!email) return "";

  const normalizedEmail = email.trim();

  if (role === "ADMIN" && !ADMIN_EMAIL_PATTERN.test(normalizedEmail)) {
    return "Please use your authorized admin email.";
  }

  if (role === "TECHNICIAN" && !TECH_EMAIL_PATTERN.test(normalizedEmail)) {
    return "Please use your authorized technician email.";
  }

  if (
    role === "USER" &&
    (USER_FORBIDDEN_PREFIX_PATTERN.test(normalizedEmail) ||
      USER_FORBIDDEN_DOMAIN_PATTERN.test(normalizedEmail))
  ) {
    return "Please use a valid user email";
  }

  return "";
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerRole, setRegisterRole] = useState("USER");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailValidationError, setEmailValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
  const shouldShowGoogleAuth = !isRegisterMode || registerRole === "USER";
  const activeTheme = isRegisterMode
    ? REGISTER_ROLE_THEME[registerRole]
    : REGISTER_ROLE_THEME.USER;
  const areRegisterPasswordsMatching =
    isRegisterMode &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword;

  const switchAuthMode = (registerMode) => {
    setIsRegisterMode(registerMode);
    setError(null);
    setSuccess(null);
    setEmailValidationError("");
    setRegisterRole("USER");

    if (!registerMode) {
      setName("");
      setConfirmPassword("");
    }
  };

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  const emailPlaceholder =
    isRegisterMode && registerRole === "ADMIN"
      ? "Enter admin email"
      : isRegisterMode && registerRole === "TECHNICIAN"
        ? "Enter technician email"
        : "Enter user email";

  useEffect(() => {
    if (!isRegisterMode) {
      setEmailValidationError("");
      return;
    }

    setEmailValidationError(validateEmailByRole(registerRole, email));
  }, [isRegisterMode, registerRole, email]);

  const handleManualAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);

    if (isRegisterMode && password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (isRegisterMode) {
      const roleEmailError = validateEmailByRole(registerRole, email);
      if (roleEmailError) {
        setEmailValidationError(roleEmailError);
        setError(roleEmailError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await api.post("/auth/register", {
          name,
          email,
          password,
          role: registerRole,
        });
        setSuccess("Registration successful! Please login.");
        setIsRegisterMode(false);
      } else {
        const { data } = await api.post("/auth/login", {
          email,
          password,
        });
        const decodedToken = decodeJwtPayload(data.token);
        if (!decodedToken) {
          setError("Unable to determine account role from token.");
          navigate("/login", { replace: true });
          return;
        }

        const resolvedRoute = getLandingRouteFromToken(data.token);

        loginUser(data.token, {
          id: decodedToken.id || data.id,
          name: decodedToken.name || data.name,
          email: decodedToken.email || data.email,
          roles: decodedToken.roles,
        });
        navigate(resolvedRoute, {
          replace: true,
        });
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please ensure backend is running on port 8080.",
        );
        return;
      }

      if (err.response?.status === 401) {
        setError(
          isRegisterMode
            ? "Registration request was rejected. Please clear old session and try again."
            : "Invalid email or password.",
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
          <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />

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
          className={`auth-form-panel flex h-full justify-center overflow-y-auto bg-white px-5 auth-scroll-user sm:px-7 ${
            isRegisterMode
              ? "items-start py-4 sm:py-5"
              : "items-center py-2.5 sm:py-3"
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
                className={`rounded-2xl shadow-lg ${activeTheme.iconBg} ${activeTheme.iconShadow} ${
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

            {isRegisterMode && (
              <RoleSelector
                value={registerRole}
                onChange={setRegisterRole}
                accentButtonClassName={activeTheme.selectorActive}
                accentShadowClassName={activeTheme.selectorShadow}
                accentRingClassName={activeTheme.selectorRing}
                className="mb-4 sm:mb-5"
              />
            )}

            {error && (
              <div className="mb-4 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-600 sm:text-sm">
                {error}
              </div>
            )}
            {success && (
              <div
                className={`mb-4 flex items-center justify-center rounded-xl border p-2.5 text-xs font-medium sm:text-sm ${
                  isRegisterMode
                    ? activeTheme.successBox
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
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
                    placeholder="Enter your full name"
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) {
                      setError(null);
                    }
                  }}
                  className={`input-field ${
                    emailValidationError
                      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-200"
                      : ""
                  }`}
                  placeholder={emailPlaceholder}
                />
                {emailValidationError && (
                  <p className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                    {emailValidationError}
                  </p>
                )}
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
                    className={`input-field pr-12 ${
                      areRegisterPasswordsMatching
                        ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200"
                        : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className={`absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 transition ${activeTheme.hoverText}`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {!isRegisterMode && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={openForgotPasswordModal}
                      className="text-xs font-semibold text-cyan-700 transition hover:text-cyan-600"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
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
                      className={`input-field pr-12 ${
                        areRegisterPasswordsMatching
                          ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200"
                          : ""
                      }`}
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
                      className={`absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 transition ${activeTheme.hoverText}`}
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
                disabled={isSubmitting || Boolean(emailValidationError)}
                className={`mt-1 inline-flex w-full items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${
                  isRegisterMode
                    ? `bg-gradient-to-r ${activeTheme.buttonGradient} shadow-lg ${activeTheme.buttonShadow} hover:-translate-y-0.5`
                    : "primary-btn"
                }`}
              >
                {isRegisterMode ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span>{submitLabel}</span>
              </button>
            </form>

            {shouldShowGoogleAuth && (
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
            )}

            {shouldShowGoogleAuth && (
              <div className={isRegisterMode ? "mt-3 sm:mt-4" : "mt-4 sm:mt-5"}>
                <GoogleAuthButton />
              </div>
            )}

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
                  type="button"
                  onClick={() => switchAuthMode(!isRegisterMode)}
                  className={`font-semibold transition ${activeTheme.linkText}`}
                >
                  {isRegisterMode ? "Sign in" : "Register now"}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={closeForgotPasswordModal}
      />
    </div>
  );
};

export default LoginPage;
