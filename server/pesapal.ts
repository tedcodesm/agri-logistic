import { Request, Response } from "express";

interface BillingAddress {
  email_address: string;
  phone_number: string;
  country_code: string;
  first_name: string;
  last_name: string;
}

interface PesapalOrderRequest {
  id: string; // Merchant reference
  amount: number;
  description: string;
  callback_url: string;
  billing_address: BillingAddress;
}

// Lazy loaded configurations
function getPesapalConfig() {
  const isSandbox = process.env.PESAPAL_SANDBOX !== "false";
  const baseUrl = isSandbox 
    ? "https://cybersandbox.pesapal.com/api" 
    : "https://pay.pesapal.com/v3/api";
  
  return {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "",
    isSandbox,
    baseUrl
  };
}

/**
 * Step 1: Request OAuth Bearer Token from PesaPal API
 */
async function authenticatePesapal(): Promise<string | null> {
  const { consumerKey, consumerSecret, baseUrl } = getPesapalConfig();
  if (!consumerKey || !consumerSecret) {
    console.warn("⚠️ PesaPal consumer keys not configured. Real transaction API offline.");
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/PostPesapal/Authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication response status: ${response.status}`);
    }

    const data = await response.json();
    return data.token || null;
  } catch (err) {
    console.error("Failed to authenticate with PesaPal:", err);
    return null;
  }
}

/**
 * Step 2: Register Instant Payment Notification (IPN) callback if needed
 */
async function registerIpn(token: string, ipnUrl: string): Promise<string | null> {
  const { baseUrl } = getPesapalConfig();
  try {
    const response = await fetch(`${baseUrl}/Services/RegisterIPN`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: "GET" // Or "POST"
      })
    });

    if (!response.ok) {
      throw new Error(`RegisterIPN status: ${response.status}`);
    }

    const data = await response.json();
    return data.ipn_id || null;
  } catch (err) {
    console.error("Failed to register IPN on PesaPal:", err);
    return null;
  }
}

/**
 * Step 3: Initiate real Checkout URL
 */
export async function initiatePayment(order: PesapalOrderRequest, appUrl: string): Promise<{
  orderTrackingId?: string;
  merchantReference: string;
  redirectUrl: string;
  isSimulated: boolean;
}> {
  const token = await authenticatePesapal();
  
  // Clean clean fallback URL if credentials are not configured
  if (!token) {
    const simulatedRedirect = `/api/pesapal/simulated-checkout?id=${order.id}&amount=${order.amount}&desc=${encodeURIComponent(order.description)}&email=${encodeURIComponent(order.billing_address.email_address)}`;
    return {
      merchantReference: order.id,
      redirectUrl: simulatedRedirect,
      isSimulated: true
    };
  }

  const { baseUrl } = getPesapalConfig();
  try {
    // 1. Establish the IPN path
    const ipnUrl = `${appUrl}/api/pesapal/ipn-callback`;
    const ipnId = await registerIpn(token, ipnUrl) || "demo-ipn-id-fallback";

    // 2. Transmit the purchase order details
    const response = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        id: order.id,
        currency: "KES",
        amount: order.amount,
        description: order.description,
        callback_url: order.callback_url,
        notification_id: ipnId,
        billing_address: {
          email_address: order.billing_address.email_address,
          phone_number: order.billing_address.phone_number,
          country_code: order.billing_address.country_code,
          first_name: order.billing_address.first_name,
          last_name: order.billing_address.last_name
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PesaPal Order submission failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      orderTrackingId: data.order_tracking_id,
      merchantReference: data.merchant_reference,
      redirectUrl: data.redirect_url,
      isSimulated: false
    };
  } catch (err) {
    console.error("Error invoking PesaPal API:", err);
    // Graceful fallback URL if server triggers any connection or credit error
    const simulatedRedirect = `/api/pesapal/simulated-checkout?id=${order.id}&amount=${order.amount}&desc=${encodeURIComponent(order.description)}&email=${encodeURIComponent(order.billing_address.email_address)}&error=connection_error`;
    return {
      merchantReference: order.id,
      redirectUrl: simulatedRedirect,
      isSimulated: true
    };
  }
}

/**
 * Step 4: Verify Order Transaction Status (IPN polling or verification)
 */
export async function getTransactionStatus(trackingId: string, merchantRef: string): Promise<string> {
  const token = await authenticatePesapal();
  if (!token) return "COMPLETED_SIMULATION";

  const { baseUrl } = getPesapalConfig();
  try {
    const response = await fetch(`${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) return "PENDING";
    const data = await response.json();
    // PesaPal statuses: COMPLETED, PENDING, FAILED
    return data.status || "PENDING";
  } catch (err) {
    console.error("Failed to query transaction status:", err);
    return "PENDING";
  }
}
