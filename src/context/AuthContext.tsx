import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthSession, UserRole } from "../types/auth";
import { clearSession, loadSession, saveSession } from "../lib/authSession";
import { getDashboardHomePath } from "../lib/dashboardPaths";

interface AuthContextValue {
  user: AuthSession | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  redirectToDashboard: (role: UserRole) => void;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthSession | null>(() => loadSession());
  const [showAuthModal, setShowAuthModal] = useState(false);

  const login = useCallback((session: AuthSession) => {
    saveSession(session);
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const redirectToDashboard = useCallback(
    (role: UserRole) => {
      navigate(getDashboardHomePath(role), { replace: true });
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      redirectToDashboard,
      showAuthModal,
      openAuthModal: () => setShowAuthModal(true),
      closeAuthModal: () => setShowAuthModal(false),
    }),
    [user, login, logout, redirectToDashboard, showAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
