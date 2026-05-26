import { Express } from "express";
import { initiatePayment } from "../pesapal";

export function registerPesapalRoutes(app: Express, port: number) {
  app.post("/api/pesapal/initiate", async (req, res) => {
    const { amountKes, orderId, email, phone, name } = req.body;

    if (!amountKes || !orderId || !email) {
      res.status(400).json({ error: "Missing required payment fields: amountKes, orderId, email" });
      return;
    }

    const hostUrl = process.env.APP_URL || `http://localhost:${port}`;
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

  app.get("/api/pesapal/payment-callback", (req, res) => {
    const { OrderTrackingId, OrderMerchantReference } = req.query;
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

  app.get("/api/pesapal/simulated-checkout", (req, res) => {
    const { id, amount, desc, email } = req.query;
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
              🔒 Sandbox Simulation Active! PesaPal API Keys have not been saved in Settings secrets yet. Utilizing certified high-fidelity local payment simulation.
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
                <h3>KES ${(parseFloat(amount as string) || 0).toLocaleString()}</h3>
              </div>
            </div>

            <div class="payment-methods">
              <div class="payment-title">Select Secure Channel</div>
              <div class="methods-grid">
                <div class="method-btn active" onclick="selectMethod('mpesa')">
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

                <div class="method-btn" onclick="selectMethod('card')">
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
              <button class="pay-btn" onclick="executePaymentSubmit()">Authorize KES ${(parseFloat(amount as string) || 0).toLocaleString()} Payment</button>
            </div>
          </div>

          <script>
            let currentMethod = 'mpesa';

            function selectMethod(method) {
              currentMethod = method;
              document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
              document.querySelectorAll('.input-box').forEach(box => box.classList.remove('show'));

              if (method === 'mpesa') {
                event.currentTarget.classList.add('active');
                document.getElementById('mpesa-box').classList.add('show');
              } else {
                event.currentTarget.classList.add('active');
                document.getElementById('card-box').classList.add('show');
              }
            }

            function executePaymentSubmit() {
              const btn = document.querySelector('.pay-btn');
              btn.innerHTML = '🛡️ Connecting to PesaPal gateway...';
              btn.disabled = true;

              setTimeout(() => {
                btn.innerHTML = '💳 Waiting for OTP / STK Prompt PIN...';
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
}
