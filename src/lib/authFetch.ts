import { loadSession } from "./authSession";

/** Attaches session headers for API routes protected by server authGuard. */
export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const session = loadSession();
  const headers = new Headers(init.headers);
  if (session) {
    headers.set("x-agri-user-email", session.email);
    headers.set("x-agri-user-role", session.role);
  }
  return fetch(input, { ...init, headers });
}
