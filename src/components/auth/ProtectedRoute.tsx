import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath, roleFromDashboardPath } from "../../lib/dashboardPaths";
import { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When set, user role must match this dashboard */
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location.pathname, authRequired: true }} replace />;
  }

  const pathRole = roleFromDashboardPath(location.pathname);
  const roleToEnforce = requiredRole ?? pathRole;

  if (roleToEnforce && user.role !== roleToEnforce) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
