import { UserRole } from "../types/auth";

export function getDashboardPath(role: UserRole): string {
  return `/dashboard/${role}`;
}

export function getDashboardHomePath(role: UserRole): string {
  return `/dashboard/${role}/overview`;
}

export function roleFromDashboardPath(pathname: string): UserRole | null {
  const match = pathname.match(/^\/dashboard\/(farmer|buyer|driver|admin)(?:\/|$)/);
  return match ? (match[1] as UserRole) : null;
}
