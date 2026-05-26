import React, { useState, useEffect } from "react";
import { User, LogIn, Key, ShieldCheck, Database, X, AlertCircle } from "lucide-react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "driver" | "admin";
}

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<"farmer" | "buyer" | "driver" | "admin">("farmer");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(true);

  // Fetch registered directory for easy sandbox profile selections
  useEffect(() => {
    async function fetchDevDirectory() {
      try {
        const res = await fetch("/api/auth/users");
        const data = await res.json();
        if (data.users) {
          setDbUsers(data.users);
          // Simple diagnostics to check if fallback array is printed
          const uriValue = data.users.some((u: any) => u.id.startsWith("U-"));
          setIsUsingFallback(uriValue);
        }
      } catch (e) {
        console.error("Could not fetch user seeds:", e);
      }
    }
    fetchDevDirectory();
  }, [successMsg]);

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const endpoint = activeTab === "LOGIN" ? "/api/auth/login" : "/api/auth/register";
    const bodyPayload = activeTab === "LOGIN" 
      ? { email, password } 
      : { email, password, name, role };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMsg(activeTab === "LOGIN" ? "Welcome back! Correctly authorized." : "Registration successful!");
      
      setTimeout(() => {
        if (activeTab === "LOGIN" && data.user) {
          onLoginSuccess(data.user);
          onClose();
        } else {
          // Switch to login tab on register success
          setActiveTab("LOGIN");
          setEmail(bodyPayload.email);
          setPassword("");
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Credential verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickLogin(userSeed: any) {
    setEmail(userSeed.email);
    setPassword("password123");
  }

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        
        {/* Header bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">MongoDB Gateway Login</h2>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Agrilogistics Security Node</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database state diagnostics info banner */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isUsingFallback ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
          <span className="text-slate-400 text-[11px]">
            State: {isUsingFallback 
              ? "Local High-Fidelity Sandboxed Fallback (Configure MONGODB_URI to link Atlas)" 
              : "Live Connected Atlas MongoDB Cluster"
            }
          </span>
        </div>

        <form onSubmit={handleAuthenticate} className="p-6 space-y-4 flex-1">
          {/* Tabs header */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab("LOGIN"); setErrorMsg(""); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "LOGIN" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In Account
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("REGISTER"); setErrorMsg(""); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "REGISTER" ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up (Register)
            </button>
          </div>

          {/* Feedback logs */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3 font-sans text-xs text-slate-300">
            {activeTab === "REGISTER" && (
              <>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Human Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Wanjiku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-755 rounded-lg p-2.5 outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ecosystem Role</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["farmer", "buyer", "driver", "admin"] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`capitalize py-2 rounded-lg font-semibold transition-all text-[10px] border ${
                          role === r 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500" 
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Username</label>
              <input
                type="email"
                required
                placeholder="e.g. user@agrilogistics.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-755 rounded-lg p-2.5 outline-none focus:border-emerald-500 text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Account Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-755 rounded-lg p-2.5 outline-none focus:border-emerald-500 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <LogIn className="w-4 h-4 text-slate-950" />
            {isLoading ? "Validating security..." : activeTab === "LOGIN" ? "Authorize Sign In" : "Register Account"}
          </button>
        </form>

        {/* Dynamic Dev account presets directory */}
        {dbUsers.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Ecosystem Presets Directory (Quick Click to Fill credentials)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {dbUsers.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 p-1.5 px-2.5 rounded-lg text-left text-[11px] text-slate-300 transition-all flex items-center justify-between cursor-pointer w-[48%]"
                >
                  <div className="truncate pr-1">
                    <strong className="block text-slate-100 truncate text-[10.5px]">{u.name}</strong>
                    <span className="text-[9.5px] text-slate-500 block truncate font-mono">{u.email}</span>
                  </div>
                  <span className="text-[8px] uppercase px-1.5 py-0.5 bg-slate-950 font-bold rounded text-emerald-400 capitalize">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
