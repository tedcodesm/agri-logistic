import { Express } from "express";
import { sendSMS, makeVoiceCall } from "../africastalking";

export function registerAfricasTalkingRoutes(app: Express, port: number) {
  app.post("/api/africastalking/send-sms", async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
      res.status(400).json({ error: "Missing required SMS parameters: to, message" });
      return;
    }

    try {
      const response = await sendSMS({ to, message });
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: "SMS sending process failed", details: err.message });
    }
  });

  app.post("/api/africastalking/make-call", async (req, res) => {
    const { to, textToSay } = req.body;
    if (!to || !textToSay) {
      res.status(400).json({ error: "Missing required Voice parameters: to, textToSay" });
      return;
    }

    const hostUrl = process.env.APP_URL || `http://localhost:${port}`;
    try {
      const response = await makeVoiceCall({ to, textToSay }, hostUrl);
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: "Voice call process failed", details: err.message });
    }
  });

  app.post("/api/africastalking/voice-callback", (req, res) => {
    const text = req.query.text || req.body.text || "Jambo! This is an automated notification from your AgriLogistics ecosystem hub. All systems operational.";
    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman" playBeep="true">${text}</Say>
</Response>`);
  });
}
