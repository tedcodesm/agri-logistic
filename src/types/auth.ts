export type UserRole = "farmer" | "buyer" | "driver" | "admin";

export interface AuthSession {
  email: string;
  role: UserRole;
  /** Display only — derived from email or profile */
  name?: string;
  id?: string;
}

export interface AuthLoginResponse {
  success: boolean;
  email: string;
  role: UserRole;
  user?: AuthSession;
}
