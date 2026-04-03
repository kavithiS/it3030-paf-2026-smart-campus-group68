import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";

const INITIAL_STATE = {
  step: "email",
  email: "",
  generatedCode: "",
  enteredCode: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  error: "",
  success: "",
  isSubmitting: false,
};

const RESEND_COOLDOWN_SECONDS = 30;

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const updateState = (partialState) => {
    setState((prev) => ({ ...prev, ...partialState }));
  };

  const closeModal = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    setResendCooldownSeconds(0);
    setState(INITIAL_STATE);
    onClose();
  };

  const startResendCooldown = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldownSeconds((secondsLeft) => {
        if (secondsLeft <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }

          return 0;
        }

        return secondsLeft - 1;
      });
    }, 1000);
  };

  const requestVerificationCode = async () => {
    const { data } = await api.post("/auth/forgot-password", {
      email: state.email,
    });

    const verificationCode = data?.verificationCode;
    if (!verificationCode) {
      throw new Error("Failed to generate verification code.");
    }

    updateState({
      generatedCode: String(verificationCode),
      step: "verify",
      enteredCode: "",
    });

    startResendCooldown();

    globalThis.alert(`Your verification code is: ${verificationCode}`);
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    if (state.isSubmitting) return;

    updateState({ error: "", success: "" });

    if (!state.email.trim()) {
      updateState({ error: "Email is required." });
      return;
    }

    updateState({ isSubmitting: true });

    try {
      await requestVerificationCode();
      updateState({ success: "" });
    } catch (err) {
      updateState({
        error:
          err.response?.data?.message ||
          err.message ||
          "Unable to send verification code.",
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  const handleResendVerificationCode = async () => {
    if (state.isSubmitting || resendCooldownSeconds > 0) return;

    updateState({ error: "", success: "", isSubmitting: true });

    try {
      await requestVerificationCode();
    } catch (err) {
      updateState({
        error:
          err.response?.data?.message ||
          err.message ||
          "Unable to resend verification code.",
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    updateState({ error: "", success: "" });

    if (state.enteredCode.trim() !== state.generatedCode) {
      updateState({ error: "Invalid verification code." });
      return;
    }

    updateState({
      step: "reset",
      success: "Code verified successfully.",
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (state.isSubmitting) return;

    updateState({ error: "", success: "" });

    if (state.newPassword !== state.confirmPassword) {
      updateState({
        error: "New password and confirm password do not match.",
      });
      return;
    }

    updateState({ isSubmitting: true });

    try {
      await api.post("/auth/reset-password", {
        email: state.email,
        currentPassword: state.currentPassword,
        newPassword: state.newPassword,
      });

      updateState({
        success: "Password reset successful. You can now sign in.",
      });
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      updateState({
        error: err.response?.data?.message || "Unable to reset password.",
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  let resendButtonLabel = "Resend Code";
  if (state.isSubmitting) {
    resendButtonLabel = "Sending new code...";
  } else if (resendCooldownSeconds > 0) {
    resendButtonLabel = `Resend Code (${resendCooldownSeconds}s)`;
  }

  let modalTitle = "Request Verification Code";
  let modalDescription =
    "Enter your registered email to receive a verification code.";

  if (state.step === "verify") {
    modalTitle = "Verify Security Code";
    modalDescription = "Enter the 6-digit code shown in the popup.";
  } else if (state.step === "reset") {
    modalTitle = "Reset Your Password";
    modalDescription = "Verify your current password and set a new password.";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          Close
        </button>
        <div className="mb-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{modalDescription}</p>
          </div>
        </div>

        {state.error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.success}
          </div>
        )}

        {state.step === "email" && (
          <form onSubmit={handleSendVerificationCode} className="space-y-4">
            <div>
              <label
                htmlFor="forgotEmail"
                className="mb-1 block text-sm font-semibold text-slate-600"
              >
                Registered Email Address
              </label>
              <input
                id="forgotEmail"
                type="email"
                required
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                className="input-field"
                placeholder="Enter your registered email"
              />
            </div>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.isSubmitting ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {state.step === "verify" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label
                htmlFor="verificationCode"
                className="mb-1 block text-sm font-semibold text-slate-600"
              >
                6-Digit Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                required
                value={state.enteredCode}
                onChange={(e) => updateState({ enteredCode: e.target.value })}
                className="input-field"
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResendVerificationCode}
                disabled={state.isSubmitting || resendCooldownSeconds > 0}
                className="text-xs font-semibold text-cyan-700 transition hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resendButtonLabel}
              </button>
            </div>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Verify Code
            </button>
          </form>
        )}

        {state.step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="forgotCurrentPassword"
                className="mb-1 block text-sm font-semibold text-slate-600"
              >
                Current Account Password
              </label>
              <input
                id="forgotCurrentPassword"
                type="password"
                required
                value={state.currentPassword}
                onChange={(e) =>
                  updateState({ currentPassword: e.target.value })
                }
                className="input-field"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label
                htmlFor="forgotNewPassword"
                className="mb-1 block text-sm font-semibold text-slate-600"
              >
                New Password
              </label>
              <input
                id="forgotNewPassword"
                type="password"
                required
                value={state.newPassword}
                onChange={(e) => updateState({ newPassword: e.target.value })}
                className="input-field"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label
                htmlFor="forgotConfirmPassword"
                className="mb-1 block text-sm font-semibold text-slate-600"
              >
                Confirm New Password
              </label>
              <input
                id="forgotConfirmPassword"
                type="password"
                required
                value={state.confirmPassword}
                onChange={(e) =>
                  updateState({ confirmPassword: e.target.value })
                }
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.isSubmitting ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

ForgotPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordModal;
