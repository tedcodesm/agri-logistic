import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Loader2, Sprout, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthSession, UserRole } from "../types/auth";
import RoleCardGrid from "./auth/RoleCard";

const DEMO_ACCOUNTS: { email: string; role: UserRole; label: string }[] = [
  { email: "farmer@agrilogistics.ke", role: "farmer", label: "Farmer demo" },
  { email: "buyer@agrilogistics.ke", role: "buyer", label: "Buyer demo" },
  { email: "driver@agrilogistics.ke", role: "driver", label: "Driver demo" },
  { email: "admin@agrilogistics.ke", role: "admin", label: "Admin demo" },
];

const DEMO_PASSWORD = "password123";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] || "User";
  return local
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, login, redirectToDashboard } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!showAuthModal) return null;

  function resetFeedback() {
    setErrorMsg("");
    setSuccessMsg("");
  }

  function completeLogin(session: AuthSession) {
    login(session);
    closeAuthModal();
    redirectToDashboard(session.role);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetFeedback();
    setIsLoading(true);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "signin"
        ? { email, password }
        : { email, password, role };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const session: AuthSession = {
        email: data.email ?? data.user?.email ?? email,
        role: data.role ?? data.user?.role,
        name: data.user?.name ?? displayNameFromEmail(data.email ?? email),
        id: data.user?.id,
      };

      if (!session.email || !session.role) {
        throw new Error("Invalid response from server.");
      }

      setSuccessMsg(mode === "signup" ? "Welcome to Agri Link!" : "Welcome back!");
      setTimeout(() => completeLogin(session), 400);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setRole(account.role);
    resetFeedback();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-md p-0 sm:p-4"
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[440px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl text-slate-100"
          role="dialog"
          aria-labelledby="auth-modal-title"
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-agri-emerald to-emerald-700 shadow-lg shadow-emerald-500/20">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 id="auth-modal-title" className="text-xl font-display font-bold text-white tracking-tight">
                    Welcome to Agri Link
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Secure agricultural trade &amp; logistics platform
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAuthModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  resetFeedback();
                }}
                className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  mode === "signin" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  resetFeedback();
                }}
                className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  mode === "signup" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Create account
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    I am joining as
                  </p>
                  <RoleCardGrid value={role} onChange={setRole} />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-agri-emerald focus:ring-2 focus:ring-agri-emerald/20 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-agri-emerald focus:ring-2 focus:ring-agri-emerald/20 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-agri-emerald hover:bg-agri-emerald-dark disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "signin" ? "Signing in…" : "Creating account…"}
                  </>
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick demo access
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:border-agri-emerald/50 hover:text-white transition-colors"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
