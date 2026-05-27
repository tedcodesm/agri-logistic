import { Request, Response, NextFunction } from "express";
import { findUserByEmail } from "../db";

export interface AuthenticatedRequest extends Request {
  authUser?: { email: string; role: string };
}

/**
 * Validates session headers set by the client after login.
 * Attach on routes that must not be called anonymously.
 */
export async function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const email = req.headers["x-agri-user-email"] as string | undefined;
  const role = req.headers["x-agri-user-role"] as string | undefined;

  if (!email || !role) {
    res.status(401).json({ error: "Please sign in to continue." });
    return;
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || user.role !== role) {
      res.status(401).json({ error: "Session expired. Please sign in again." });
      return;
    }
    req.authUser = { email: user.email, role: user.role };
    next();
  } catch {
    res.status(500).json({ error: "Could not verify your session." });
  }
}
