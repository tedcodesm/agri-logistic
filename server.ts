import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { registerAuthRoutes } from "./server/routes/auth";
import { registerAfricasTalkingRoutes } from "./server/routes/africastalkingRoutes";
import { registerGeminiRoutes } from "./server/routes/gemini";
import { registerMarketRoutes } from "./server/routes/market";
import { registerPesapalRoutes } from "./server/routes/pesapalRoutes";

// FIX: Import helpers that were called but never imported.
// These must be exported from their respective modules.
import { registerNewUser, findUserByEmail, listAllRegisteredUsers } from "./server/db";
import { initiatePayment } from "./server/pesapal";
import { sendSMS, makeVoiceCall } from "./server/africastalking";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// FIX: Register all imported route modules with the Express app.
// Previously these were imported but never mounted — their routes didn't exist.
registerAuthRoutes(app);
registerAfricasTalkingRoutes(app);
registerGeminiRoutes(app);
registerMarketRoutes(app);
registerPesapalRoutes(app);

// Initialize Gemini safely, handling absolute missing keys gracefully
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Successfully initialized server-side Gemini client.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.warn(
    "⚠️ GEMINI_API_KEY is not configured or left as default placeholder. " +
    "Falling back to high-fidelity simulated local analytics layer."
  );
}

// ----------------------------------------------------
// A. Agri-Logistics AI Grounding - Chat & Translation
// ----------------------------------------------------
app.post("/api/gemini/chat", async (req: Request, res: Response): Promise<void> => {
  const { message, history, language } = req.body;
  const isSwh = language === "kiswahili" || language === "swh";

  if (!ai) {
    const fallbackAnswer = isSwh
      ? `[Simulated AI - Sanidi API_KEY] Jambo! Nashukuru kwa swali lako kuhusu "${message}". Kwa sasa tunatumia mfumo salama wa kiintelijensia katika bandari 3000. Bepresha ya soko la viazi ni KES 3,200 kwa gunia Wote.`
      : `[Simulated AI - API_KEY Not Set] Jambo! Thank you for querying "${message}". Currently, internal analytics show Nairobi wholesale market maize prices averaging KES 4,100 per 90Kg bag this week. Spoilage risk is high due to Meru rains.`;
    res.json({ text: fallbackAnswer });
    return;
  }

  try {
    const isVoiceListing = req.body.isVoiceListing || false;
    let systemPrompt = `You are "Mkulima Intel", an elite Agri-Logistics & Supply-Chain Optimization AI specialized in Kenyan agriculture.
    You assist farmers, buyers, and transporters with:
    1. Direct English-Kiswahili agricultural technical support.
    2. Pricing trends (e.g., maize, potatoes, tomatoes in markets like Nairobi, Wote, Mombasa, Eldoret).
    3. Warehousing climate tips (moisture below 13.5% for grains).
    4. Post-harvest loss mitigation advice.

    If the user requests voice listing transcription, extract and return a pure structured JSON following this model:
    cropName, quantityKg, pricePerKgKes, description. Otherwise, deliver highly helpful answers.
    Tone: Friendly, professional, localized (mentions counties like Makueni, Nakuru, Nyandarua, Meru).`;

    if (isSwh) {
      systemPrompt += " Jibu kwa Kiswahili fasaha chenye msaada kwa mkulima mdogo.";
    }

    const response = await ai.models.generateContent({
      // FIX: "gemini-3.5-flash" does not exist. Use a real model name.
      model: "gemini-1.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I was unable to process that. Please try again." });
  } catch (error: any) {
    console.error("Error invoking Gemini:", error);
    res.status(500).json({ error: "Gemini server call failed", detail: error.message });
  }
});

// ----------------------------------------------------
// B. Price Prediction & Market Intelligence Engine
// ----------------------------------------------------
app.post("/api/predict-price", async (req: Request, res: Response) => {
  const { cropName, county, grade } = req.body;

  const basePrices: Record<string, number> = {
    Maize: 40,
    Beans: 95,
    Potatoes: 32,
    Tomatoes: 65,
    Cabbage: 18,
    Avocados: 75,
  };

  const defaultPrice = 50;
  const pivot = basePrices[cropName] || defaultPrice;
  const gradeMultiplier = grade === "A" ? 1.25 : grade === "B" ? 1.0 : 0.75;
  const countyFactor = county === "Nairobi" ? 1.15 : county === "Uasin Gishu" ? 0.9 : 1.02;

  const predictedBase = Math.round(pivot * gradeMultiplier * countyFactor);

  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May (Current)", "Jun (Proj)", "Jul (Proj)", "Aug (Proj)"];
  const historicalData = months.map((m, idx) => {
    const cycleFactor = 1 + 0.15 * Math.sin((idx / 3) * Math.PI);
    const deviation = (Math.random() - 0.5) * 4;
    return {
      month: m,
      priceKes: Math.max(8, Math.round(predictedBase * cycleFactor + deviation)),
      avgDemandTons: Math.round(150 + Math.sin(idx / 2) * 40),
    };
  });

  res.json({
    crop: cropName,
    predictedPricePerKg: predictedBase,
    optimalStorageTempCelsius: cropName === "Potatoes" ? 8 : cropName === "Tomatoes" ? 12 : 15,
    maxMoistureAllowedPct: cropName === "Maize" ? 13.5 : cropName === "Beans" ? 14 : 20,
    spoilageHorizonDays: cropName === "Tomatoes" ? 7 : cropName === "Potatoes" ? 45 : 120,
    historicalPricing: historicalData,
    regionalAnomalies: [
      { location: "Nairobi (Wakulima)", premiumPct: 20, activeBuyers: 45 },
      { location: "Wote Collection Center", premiumPct: -5, activeBuyers: 12 },
      { location: "Mombasa Terminal", premiumPct: 15, activeBuyers: 28 },
    ],
  });
});

// ----------------------------------------------------
// C. M-PESA STK Push & Ledger Callback Simulation
// ----------------------------------------------------
app.post("/api/mpesa-simulate", (req: Request, res: Response) => {
  const { phoneNumber, amountKes, orderId } = req.body;

  if (!phoneNumber || !amountKes) {
    res.status(400).json({ error: "Phone number and amount required" });
    return;
  }

  const transactionId = "MPESA-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  res.json({
    status: "Initiated",
    message: `STK push request triggered successfully for phone ${phoneNumber}.`,
    checkoutRequestID: "ws_CO_21052026111510_" + Math.round(Math.random() * 1000000),
    amount: amountKes,
    orderId,
    transactionId,
    timestamp: new Date().toISOString(),
    instructions: "Please enter your MPESA PIN inside the prompt container.",
  });
});

// ----------------------------------------------------
// D. MongoDB User Authentication
// ----------------------------------------------------
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
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

app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
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
    // FIX: Was res.status(505) — HTTP 505 is "HTTP Version Not Supported", not a server error code.
    res.status(500).json({ error: "Authorization query failed", detail: err.message });
  }
});

app.get("/api/auth/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await listAllRegisteredUsers();
    res.json({ users: list });
  } catch (err: any) {
    res.status(500).json({ error: "Could not retrieve user directory", detail: err.message });
  }
});

// ----------------------------------------------------
// E. PesaPal API v3 Web Checkout Service
// ----------------------------------------------------
app.post("/api/pesapal/initiate", async (req: Request, res: Response): Promise<void> => {
  const { amountKes, orderId, email, phone, name } = req.body;

  if (!amountKes || !orderId || !email) {
    res.status(400).json({ error: "Missing required payment fields: amountKes, orderId, email" });
    return;
  }

  const hostUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  const paymentPayload = {
    id: orderId,
    amount: parseFloat(amountKes),
    description: `Agricultural Order Purchase Contract #${orderId}`,
    callback_url: `${hostUrl}/api/pesapal/payment-callback`,
    billing_address: {
      email_address: email,
      phone_number: phone || "0711000000",
      country_code: "KE",
      first_name: name ? name.split(" ")[0] : "Agri",
      last_name: name && name.split(" ").length > 1 ? name.split(" ")[1] : "Buyer",
    },
  };

  try {
    const response = await initiatePayment(paymentPayload, hostUrl);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: "PesaPal execution failed", details: err.message });
  }
});

app.get("/api/pesapal/payment-callback", (req: Request, res: Response) => {
  // FIX: Cast query params to string — Express types them as string | ParsedQs | string[] | ParsedQs[]
  const OrderTrackingId = req.query.OrderTrackingId as string;
  const OrderMerchantReference = req.query.OrderMerchantReference as string;

  res.send(`
    <html>
      <head>
        <title>PesaPal Payment Verified</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin:0; }
          .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); text-align: center; max-width: 450px; border: 1px solid #e2e8f0; }
          .checkmark { width: 60px; height: 60px; border-radius: 50%; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 20px; }
          h2 { color: #0f172a; margin-top: 0; font-weight: 700; font-size: 22px; }
          p { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }
          .badge { background: #f1f5f9; color: #334155; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 30px; }
          .btn { background: #10b981; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; transition: background 0.2s; }
          .btn:hover { background: #059669; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="checkmark">✓</div>
          <h2>PesaPal Transaction Successful</h2>
          <p>Your payment for Order <strong>#${OrderMerchantReference || "Unknown"}</strong> has been processed. The funds are held securely until cold chain GPS delivery coordinates signature is recorded.</p>
          <div class="badge">Trace ID: ${OrderTrackingId || "PESA-D-SLOP-802"}</div>
          <br/>
          <button class="btn" style="outline: none;" onclick="window.close(); if(window.opener) { window.opener.focus(); }">Return to Marketplace Console</button>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'PESAPAL_PAYMENT_SUCCESS', orderId: '${OrderMerchantReference || ""}' }, '*');
          }
        </script>
      </body>
    </html>
  `);
});

app.get("/api/pesapal/simulated-checkout", (req: Request, res: Response) => {
  // FIX: Cast all query params to string
  const id = req.query.id as string;
  const amount = req.query.amount as string;
  const desc = req.query.desc as string;
  const email = req.query.email as string;

  res.send(`
    <html>
      <head>
        <title>PesaPal Secure Checkout Gateway</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f1f5f9; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .container { background: #1e293b; max-width: 480px; width: 100%; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .header { background: #d97706; padding: 25px; color: white; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.025em; }
          .header span { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .details { padding: 25px; border-bottom: 1px solid #334155; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .detail-row .label { color: #94a3b8; }
          .detail-row .val { font-weight: 600; }
          .total { border-top: 1px dashed #475569; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }
          .total h3 { margin: 0; color: #f59e0b; font-size: 22px; font-weight: 750; }
          .payment-methods { padding: 25px; }
          .payment-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 15px; }
          .methods-grid { display: flex; flex-direction: column; gap: 12px; }
          .method-btn { background: #334155; border: 1px solid #475569; border-radius: 12px; padding: 15px; text-align: left; color: white; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
          .method-btn:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
          .method-btn.active { border-color: #f59e0b; background: rgba(245, 158, 11, 0.15); }
          .input-box { background: #0f172a; border: 1px solid #475569; border-radius: 10px; padding: 10px 14px; margin-top: 12px; display: none; }
          .input-box.show { display: block; }
          .input-box label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 5px; }
          .input-box input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 14px; font-weight: 600; }
          .footer-actions { padding: 0 25px 25px; }
          .pay-btn { width: 100%; background: #f59e0b; color: #0f172a; border: none; border-radius: 12px; padding: 16px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; }
          .pay-btn:hover { background: #d97706; transform: translateY(-1px); }
          .api-warning { font-size: 11px; text-align: center; color: #f59e0b; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.1); padding: 10px; border-radius: 8px; margin: 15px 25px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>PesaPal SecurePay</h1>
              <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">Licensed Central Bank Kenya Gateway</div>
            </div>
            <span>SANDBOX MODE</span>
          </div>

          <div class="api-warning">
            Sandbox Simulation Active — PesaPal API Keys not yet configured in environment secrets.
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="label">Merchant:</span>
              <span class="val">KE-AgriLogistics Link</span>
            </div>
            <div class="detail-row">
              <span class="label">Reference:</span>
              <span class="val">#${id || "ORD-000"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Crop Deliverables:</span>
              <span class="val">${desc || "Agro contract stock"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Buyer Email:</span>
              <span class="val">${email || "registered@agri.ke"}</span>
            </div>
            <div class="total">
              <span style="font-size: 14px; color: #94a3b8; font-weight: 500;">Authorized Payable:</span>
              <h3>KES ${(parseFloat(amount) || 0).toLocaleString()}</h3>
            </div>
          </div>

          <div class="payment-methods">
            <div class="payment-title">Select Secure Channel</div>
            <div class="methods-grid">
              <div class="method-btn active" onclick="selectMethod(event, 'mpesa')">
                <div>
                  <strong style="display:block; font-size: 14px;">M-PESA Express</strong>
                  <span style="font-size: 11px; color:#94a3b8;">Instant Daraja STK prompt callback</span>
                </div>
                <span style="color:#22c55e; font-weight:bold; font-size:12px;">Safaricom</span>
              </div>
              <div id="mpesa-box" class="input-box show">
                <label>Safaricom Phone Number</label>
                <input type="text" id="phone" value="0711999222" placeholder="e.g. 0711******">
              </div>
              <div class="method-btn" onclick="selectMethod(event, 'card')">
                <div>
                  <strong style="display:block; font-size: 14px;">Visa / Mastercard / Amex</strong>
                  <span style="font-size: 11px; color:#94a3b8;">Bank tier clearing protocol</span>
                </div>
                <span style="color:#3b82f6; font-weight:bold; font-size:12px;">Secured</span>
              </div>
              <div id="card-box" class="input-box">
                <label>Credit Card Number</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" placeholder="CRD-xxxx-xxxx-xxxx-xxxx" style="width:70%;">
                  <input type="text" placeholder="MM/YY" style="width:15%">
                  <input type="text" placeholder="CVC" style="width:15%">
                </div>
              </div>
            </div>
          </div>

          <div class="footer-actions">
            <button class="pay-btn" onclick="executePaymentSubmit()">Authorize KES ${(parseFloat(amount) || 0).toLocaleString()} Payment</button>
          </div>
        </div>

        <script>
          let currentMethod = 'mpesa';

          // FIX: Pass event explicitly — using global event object is unreliable and deprecated
          function selectMethod(event, method) {
            currentMethod = method;
            document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.input-box').forEach(box => box.classList.remove('show'));
            event.currentTarget.classList.add('active');
            if (method === 'mpesa') {
              document.getElementById('mpesa-box').classList.add('show');
            } else {
              document.getElementById('card-box').classList.add('show');
            }
          }

          function executePaymentSubmit() {
            const btn = document.querySelector('.pay-btn');
            btn.innerHTML = 'Connecting to PesaPal gateway...';
            btn.disabled = true;
            setTimeout(() => {
              btn.innerHTML = 'Waiting for OTP / STK Prompt PIN...';
              setTimeout(() => {
                window.location.href = '/api/pesapal/payment-callback?OrderTrackingId=PESA-SIM-TRK-' + Math.round(Math.random() * 900000 + 100000) + '&OrderMerchantReference=${id || ""}';
              }, 1200);
            }, 1000);
          }
        </script>
      </body>
    </html>
  `);
});

// ----------------------------------------------------
// F. Africa's Talking Voice & SMS Alert Service
// ----------------------------------------------------
app.post("/api/africastalking/send-sms", async (req: Request, res: Response): Promise<void> => {
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

app.post("/api/africastalking/make-call", async (req: Request, res: Response): Promise<void> => {
  const { to, textToSay } = req.body;

  if (!to || !textToSay) {
    res.status(400).json({ error: "Missing required Voice parameters: to, textToSay" });
    return;
  }

  const hostUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  try {
    const response = await makeVoiceCall({ to, textToSay }, hostUrl);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: "Voice call process failed", details: err.message });
  }
});

app.post("/api/africastalking/voice-callback", (req: Request, res: Response) => {
  const text =
    (req.query.text as string) ||
    (req.body.text as string) ||
    "Jambo! This is an automated notification from your AgriLogistics ecosystem hub. All systems operational.";

  res.set("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman" playBeep="true">${text}</Say>
</Response>`);
});

// ----------------------------------------------------
// G. Front-end Dev Proxy & Production Asset Router
// (was mislabelled D — fixed section label)
// ----------------------------------------------------
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted — Hot reload bound to Express dev port.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production state: Serving precompiled static clients.");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Agri-Logistics Engine booted! Open http://localhost:${PORT} in your browser.`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set PORT in your environment or stop the process using it.`);
      process.exit(1);
    }
    console.error("Server listen error:", error);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});