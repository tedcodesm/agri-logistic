import { Express } from "express";
import { registerNewUser, findUserByEmail, listAllRegisteredUsers } from "../db";
import { authGuard, AuthenticatedRequest } from "../middleware/authGuard";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] || "User";
  return local
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function normalizeUser(user: Record<string, unknown> | null) {
  if (!user) return null;
  const email = String(user.email ?? "");
  return {
    id: String(user.id ?? ""),
    email,
    name: String(user.name ?? displayNameFromEmail(email)),
    role: String(user.role ?? "buyer"),
    passwordHash: String(user.passwordHash ?? ""),
  };
}

function authPayload(user: { id: string; email: string; name: string; role: string }) {
  return {
    success: true,
    email: user.email,
    role: user.role,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: "Please provide email, password, and your role." });
      return;
    }
    const name = displayNameFromEmail(email);
    try {
      const user = await registerNewUser(email, password, name, role);
      res.json(authPayload(user));
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Could not create your account." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    try {
      const raw = await findUserByEmail(email);
      const user = normalizeUser(raw as Record<string, unknown>);
      if (!user || user.passwordHash !== password) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }
      res.json(authPayload(user));
    } catch (err: any) {
      res.status(500).json({ error: "Unable to sign in right now. Please try again." });
    }
  });

  app.get("/api/auth/session", authGuard, (req: AuthenticatedRequest, res) => {
    res.json({ email: req.authUser!.email, role: req.authUser!.role });
  });

  app.get("/api/auth/users", async (req, res) => {
    try {
      const list = await listAllRegisteredUsers();
      res.json({ users: list });
    } catch (err: any) {
      res.status(500).json({ error: "Could not retrieve user directory", detail: err.message });
    }
  });
}
