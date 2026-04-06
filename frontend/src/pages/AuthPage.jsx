import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import bg3Image from "../assets/bg3.jpeg";
import {
  decodeJwtPayload,
  getLandingRouteFromToken,
  useAuth,
} from "../context/AuthContext";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
} from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import RoleSelector from "../components/RoleSelector";

const ADMIN_EMAIL_PATTERN = /^admin.*@urh\.com$/i;
const TECH_EMAIL_PATTERN = /^tech.*@urh\.com$/i;
const USER_FORBIDDEN_PREFIX_PATTERN = /^(admin|tech).*/i;
const USER_FORBIDDEN_DOMAIN_PATTERN = /@urh\.com$/i;

const REGISTER_ROLE_THEME = {
  USER: {
    selectorActive: "from-[#1E2A50] to-[#3B4A89]",
    selectorShadow: "shadow-blue-200",
    selectorRing: "ring-blue-500",
    buttonGradient: "from-[#1E2A50] to-[#3B4A89]",
    buttonShadow: "shadow-indigo-950/40",
    linkText: "text-[#1E2A50]",
    successBox: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ADMIN: {
    selectorActive: "from-[#1E2A50] to-[#3B4A89]",
    selectorShadow: "shadow-indigo-300/40",
    selectorRing: "ring-indigo-700",
    buttonGradient: "from-[#1E2A50] to-[#3B4A89]",
    buttonShadow: "shadow-indigo-950/40",
    linkText: "text-[#1E2A50]",
    successBox: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  TECHNICIAN: {
    selectorActive: "from-[#1E2A50] to-[#3B4A89]",
    selectorShadow: "shadow-cyan-300/40",
    selectorRing: "ring-cyan-700",
    buttonGradient: "from-[#1E2A50] to-[#3B4A89]",
    buttonShadow: "shadow-indigo-950/40",
    linkText: "text-[#1E2A50]",
    successBox: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
};

const validateEmailByRole = (role, email) => {
  if (!email) return "";
  const normalizedEmail = email.trim();
  if (role === "ADMIN" && !ADMIN_EMAIL_PATTERN.test(normalizedEmail))
    return "Please use your authorized admin email.";
  if (role === "TECHNICIAN" && !TECH_EMAIL_PATTERN.test(normalizedEmail))
    return "Please use your authorized technician email.";
  if (
    role === "USER" &&
    (USER_FORBIDDEN_PREFIX_PATTERN.test(normalizedEmail) ||
      USER_FORBIDDEN_DOMAIN_PATTERN.test(normalizedEmail))
  )
    return "Please use a valid user email.";
  return "";
};

function LoginForm({ onForgotPasswordClick = () => {} }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleManualAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const decodedToken = decodeJwtPayload(data.token);
      if (!decodedToken) {
        setError("Unable to determine account role from token.");
        return;
      }
      const resolvedRoute = getLandingRouteFromToken(data.token);
      loginUser(data.token, {
        id: decodedToken.id || data.id,
        name: decodedToken.name || data.name,
        email: decodedToken.email || data.email,
        roles: decodedToken.roles,
      });
      navigate(resolvedRoute, { replace: true });
    } catch (err) {
      if (err.code === "ERR_NETWORK") setError("Cannot connect to server.");
      else if (err.response?.status === 401)
        setError("Invalid email or password.");
      else if (err.response?.status === 503)
        setError("Authentication service unavailable.");
      else setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2
        className="text-center font-extrabold text-slate-900 mb-1 text-2xl sm:text-[1.85rem] tracking-tight animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        Welcome Back
      </h2>
      <p
        className="text-center text-sm text-slate-700 mb-5 animate-fade-in-up"
        style={{ animationDelay: "150ms" }}
      >
        Sign in to your account
      </p>

      {error && (
        <div className="mb-6 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur-sm p-3 text-sm font-medium text-rose-600 shadow-sm animate-fade-in-up">
          {error}
        </div>
      )}

      <form onSubmit={handleManualAuth} className="space-y-4">
        <div
          className="relative group animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "email" ? "text-blue-600" : "text-slate-500"}`}
          >
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300/70 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer"
            style={{ borderColor: focusedInput === "email" ? "#3b82f6" : "" }}
            autoComplete="email"
          />
          <label
            htmlFor="email"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1
              ${focusedInput === "email" || email ? "-top-2.5 text-xs font-bold text-blue-600 rounded-md shadow-sm bg-white" : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            Email Address
          </label>
        </div>

        <div
          className="relative group animate-fade-in-up"
          style={{ animationDelay: "250ms" }}
        >
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "password" ? "text-blue-600" : "text-slate-500"}`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            className="block w-full pl-11 pr-12 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300/70 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer"
            style={{
              borderColor: focusedInput === "password" ? "#3b82f6" : "",
            }}
            autoComplete="current-password"
          />
          <label
            htmlFor="password"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1
              ${focusedInput === "password" || password ? "-top-2.5 text-xs font-bold text-blue-600 rounded-md shadow-sm bg-white" : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className="flex justify-end animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-xs font-bold text-[#1E2A50] transition hover:text-[#3B4A89] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 bg-gradient-to-r from-[#1E2A50] to-[#3B4A89] animate-fade-in-up"
          style={{ animationDelay: "350ms" }}
        >
          <LogIn className="h-5 w-5" />
          <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
        </button>
      </form>

      <div
        className="flex items-center justify-between mt-5 animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        <span className="w-1/5 border-b border-slate-300/80 md:w-1/4" />
        <span className="text-center text-xs uppercase tracking-[0.14em] text-slate-700">
          Or continue with
        </span>
        <span className="w-1/5 border-b border-slate-300/80 md:w-1/4" />
      </div>

      <div
        className="mt-4 animate-fade-in-up"
        style={{ animationDelay: "450ms" }}
      >
        <GoogleAuthButton />
      </div>

      <div
        className="mt-5 text-center text-sm pt-3 border-t border-slate-200/70 animate-fade-in-up"
        style={{ animationDelay: "500ms" }}
      >
        <p className="text-slate-700">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[#1E2A50] transition hover:text-[#3B4A89]"
          >
            Create Account
          </Link>
        </p>
      </div>
    </>
  );
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("USER");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailValidationError, setEmailValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setEmailValidationError(validateEmailByRole(registerRole, email));
  }, [registerRole, email]);

  const areRegisterPasswordsMatching =
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword;
  const normalizedRegisterRole = registerRole?.trim?.() || "USER";
  const activeTheme =
    REGISTER_ROLE_THEME[normalizedRegisterRole] || REGISTER_ROLE_THEME.USER;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    const roleEmailError = validateEmailByRole(registerRole, email);
    if (roleEmailError) {
      setEmailValidationError(roleEmailError);
      setError(roleEmailError);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: registerRole,
      });
      setSuccess("Account Created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (err.code === "ERR_NETWORK") setError("Cannot connect to server.");
      else if (err.response?.status === 401)
        setError("Registration request was rejected.");
      else if (err.response?.status === 503)
        setError("Account Service unavailable.");
      else setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-center font-extrabold text-slate-900 mb-1 text-2xl sm:text-[1.85rem] tracking-tight">
        Create Account
      </h2>
      <p className="text-center text-sm text-slate-700 mb-4">
        Join UniReserveHub today.
      </p>

      <div>
        <RoleSelector
          value={registerRole}
          onChange={setRegisterRole}
          accentButtonClassName={activeTheme.selectorActive}
          accentShadowClassName={activeTheme.selectorShadow}
          accentRingClassName={activeTheme.selectorRing}
          className="mb-4"
        />
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-sm font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div
          className={`mb-4 flex items-center justify-center rounded-xl border p-2.5 text-sm font-medium shadow-sm ${activeTheme.successBox}`}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "name" ? activeTheme.linkText : "text-slate-500"}`}
          >
            <User className="h-5 w-5" />
          </div>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedInput("name")}
            onBlur={() => setFocusedInput(null)}
            className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300/70 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer"
            style={{ borderColor: focusedInput === "name" ? "#6366f1" : "" }}
          />
          <label
            htmlFor="name"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1 ${focusedInput === "name" || name ? `-top-2.5 text-xs font-bold ${activeTheme.linkText} rounded-md shadow-sm bg-white` : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            Full Name
          </label>
        </div>

        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "email" ? activeTheme.linkText : "text-slate-500"}`}
          >
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            className={`block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer ${emailValidationError ? "border-rose-300 focus:border-rose-500" : "border-slate-300/70"}`}
            style={{
              borderColor:
                !emailValidationError && focusedInput === "email"
                  ? "#6366f1"
                  : "",
            }}
          />
          <label
            htmlFor="email"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1 ${focusedInput === "email" || email ? `-top-2.5 text-xs font-bold ${activeTheme.linkText} rounded-md shadow-sm bg-white` : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            {registerRole === "ADMIN"
              ? "Admin Email"
              : registerRole === "TECHNICIAN"
                ? "Technician Email"
                : "Email Address"}
          </label>
          {emailValidationError && (
            <p className="mt-1 text-xs font-medium text-rose-600 px-2">
              {emailValidationError}
            </p>
          )}
        </div>

        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "password" ? activeTheme.linkText : "text-slate-500"}`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            className={`block w-full pl-11 pr-12 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300/70 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer ${areRegisterPasswordsMatching ? "border-emerald-400 focus:border-emerald-500 shadow-emerald-500/20 shadow-md transform -translate-y-0.5" : ""}`}
            style={{
              borderColor:
                !areRegisterPasswordsMatching && focusedInput === "password"
                  ? "#6366f1"
                  : "",
            }}
          />
          <label
            htmlFor="password"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1 ${focusedInput === "password" || password ? `-top-2.5 text-xs font-bold ${areRegisterPasswordsMatching ? "text-emerald-500" : activeTheme.linkText} rounded-md shadow-sm bg-white` : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative group">
          <div
            className={`absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedInput === "confirm" ? activeTheme.linkText : "text-slate-500"}`}
          >
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedInput("confirm")}
            onBlur={() => setFocusedInput(null)}
            className={`block w-full pl-11 pr-12 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-300/70 rounded-xl text-slate-900 focus:outline-none focus:bg-white/95 transition-all duration-300 shadow-sm peer ${areRegisterPasswordsMatching ? "border-emerald-400 focus:border-emerald-500 shadow-emerald-500/20 shadow-md transform -translate-y-0.5" : ""}`}
            style={{
              borderColor:
                !areRegisterPasswordsMatching && focusedInput === "confirm"
                  ? "#6366f1"
                  : "",
            }}
          />
          <label
            htmlFor="confirmPassword"
            className={`absolute left-11 transition-all duration-300 pointer-events-none px-1 ${focusedInput === "confirm" || confirmPassword ? `-top-2.5 text-xs font-bold ${areRegisterPasswordsMatching ? "text-emerald-500" : activeTheme.linkText} rounded-md shadow-sm bg-white` : "top-3 text-slate-500 text-sm bg-transparent shadow-none"}`}
          >
            Confirm Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-slate-400 hover:text-slate-600 transition"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(emailValidationError)}
          className={`mt-1 w-full flex items-center justify-center space-x-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 bg-gradient-to-r ${activeTheme.buttonGradient}`}
        >
          <UserPlus className="h-5 w-5" />
          <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
        </button>
      </form>

      {registerRole === "USER" && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="w-1/5 border-b border-slate-300/80 md:w-1/4" />
            <span className="text-center text-xs uppercase tracking-[0.14em] text-slate-700">
              Or continue with
            </span>
            <span className="w-1/5 border-b border-slate-300/80 md:w-1/4" />
          </div>
          <GoogleAuthButton />
        </div>
      )}

      <div className="mt-4 text-center text-sm pt-3 border-t border-slate-200/70">
        <p className="text-slate-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-bold transition hover:text-[#3B4A89] ${activeTheme.linkText}`}
          >
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

const AuthPage = () => {
  const location = useLocation();
  const isRegisterMode = location.pathname === "/register";
  const [signInWipeKey, setSignInWipeKey] = useState(0);
  const [registerWipeKey, setRegisterWipeKey] = useState(0);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    if (!isRegisterMode) {
      setSignInWipeKey((prev) => prev + 1);
    }
  }, [isRegisterMode]);

  useEffect(() => {
    if (isRegisterMode) {
      setRegisterWipeKey((prev) => prev + 1);
    }
  }, [isRegisterMode]);

  return (
    <div className="h-[100dvh] min-h-[100dvh] relative flex items-center justify-center overflow-hidden font-sans">
      {/* FULL SCREEN BACKGROUND */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src={bg3Image}
          alt="University Background"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2, 6, 23, 0.58) 0%, rgba(2, 6, 23, 0.46) 42%, rgba(2, 6, 23, 0.66) 100%), radial-gradient(circle at 14% 14%, rgba(30, 64, 175, 0.18), transparent 48%), radial-gradient(circle at 86% 12%, rgba(30, 58, 138, 0.14), transparent 44%)",
            backdropFilter: "blur(3px) brightness(0.9) saturate(1.06)",
          }}
        ></div>

        {/* Decorative ambient blobs */}
        <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      </div>

      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between py-4 sm:py-6">
        {/* Static Left Side (Background Text) */}
        <div className="hidden md:block md:w-1/2 lg:pl-8 text-white pr-4 animate-fade-in-up">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-200 backdrop-blur-md mb-8 hover:bg-white/20 transition-all group"
          >
            <GraduationCap className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            UniReserveHub
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold leading-[1.15] mb-6 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Manage Resources, Bookings, and Incidents in One Place
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed mb-8 max-w-lg drop-shadow-md">
            Securely sign in to manage bookings, track incidents, and easily
            stay updated across your campus operations dashboard.
          </p>

          <ul className="space-y-3">
            <li className="flex items-center text-[0.95rem] font-medium text-slate-100 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 max-w-sm hover:border-white/20 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-3 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
              Facilities & Asset Catalogue
            </li>
            <li className="flex items-center text-[0.95rem] font-medium text-slate-100 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 max-w-sm hover:border-white/20 transition-colors delay-100">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mr-3 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
              Workflow-based Booking System
            </li>
            <li className="flex items-center text-[0.95rem] font-medium text-slate-100 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 max-w-sm hover:border-white/20 transition-colors delay-200">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 mr-3 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
              Maintenance & Incident Ticketing
            </li>
          </ul>
        </div>

        {/* Dynamic Right Side (Form Container) */}
        <div className="w-full md:w-1/2 flex justify-center lg:justify-end">
          {/* Main container with high rounded corners and glassmorphism styling */}
          <div className="w-full max-w-[410px] bg-white/30 backdrop-blur-xl rounded-[2.1rem] shadow-[0_20px_40px_-20px_rgba(15,23,42,0.55)] border border-white/60 p-6 sm:p-7 relative overflow-hidden transition-all duration-500 ease-in-out">
            <div className="w-full h-full relative z-10">
              {isRegisterMode ? (
                <div key={registerWipeKey} className="auth-register-wipe">
                  <RegisterForm />
                </div>
              ) : (
                <div key={signInWipeKey} className="auth-signin-wipe">
                  <LoginForm
                    onForgotPasswordClick={() =>
                      setShowForgotPasswordModal(true)
                    }
                  />
                </div>
              )}
            </div>

            {/* decorative internal gradients based on state */}
            <div
              className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-r transition-all duration-700 ${isRegisterMode ? "from-indigo-500 to-purple-600" : "from-blue-500 to-indigo-600"}`}
            ></div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .auth-signin-wipe {
          animation: auth-wipe-in 920ms ease-out both;
        }
        .auth-register-wipe {
          animation: auth-wipe-in 1220ms ease-out both;
        }
        @keyframes auth-wipe-in {
          from { clip-path: inset(0 0 100% 0); }
          to { clip-path: inset(0 0 0 0); }
        }
      `,
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default AuthPage;
