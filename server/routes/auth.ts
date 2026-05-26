import { Express } from "express";
import { registerNewUser, findUserByEmail, listAllRegisteredUsers } from "../db";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "Missing required fields: email, password, name, role" });
      return;
    }
    try {
      const user = await registerNewUser(email, password, name, role);
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    try {
      const user = await findUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        res.status(401).json({ error: "Invalid email or credentials" });
        return;
      }
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (err: any) {
      res.status(505).json({ error: "Authorization query failed", detail: err.message });
    }
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
