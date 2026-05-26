# Agri

Agri Link is a highly secure, full-stack digital logistics and communications platform bridging smallholder farmers, wholesalers, and transit providers across Kenya. The ecosystem streamlines crop listings, escrow payment clears, grain moisture checks (<13.5%), live truck telemetries, and instant stakeholder alerts.

---

## Key Architectural Modules

### 1. Africa's Talking (AT) Communications Hub
A professional, automated telecom orchestration system providing:
* **Auto-Alert Dispatches**:
  * **To Buyers**: Instant notification whenever a crop purchase order is confirmed and Escrow begins.
  * **To Drivers**: Real-time SMS detailing assigned routes, vehicle plate numbers, and waypoint targets.
* **Interactive SMS / Voice Panel**: Allows manual broadcasting to custom subscribers or active presets (farmers, drivers, buyers).
* **Automated Voice Synthesis**: Initiates direct outbound calls executing a live XML response loop to read out text-to-speech notices to transporters over the phone.
* **Dual-State Connectivity**: Automatically toggles from a graceful interactive sandbox simulation layout to active production channels once Safaricom API secrets are added.

### 2. MongoDB Secured Gateway
Supports end-to-end actor role routing (Farmer, Buyer, Transporter, Administrator):
* Powered by Node.js, Express, and a high-fidelity database abstraction layer.
* Dynamic diagnostic indicator verifying sandbox fallback bounds vs. a live MongoDB Atlas cloud integration.

### 3.  PesaPal & Mobile Money Escrow
* Offers seamless integration toggles for **M-PESA Push**, **PesaPal**, and **COD Ledger** clearing.
* Locks down payments in escrow status until safe cargo handover is verified at cold storage hubs.

### 4.  Advanced Google Maps Routing Panel
* Visualizes real-time coordinate logs, route waypoints, and active transit truck telemetries live.
* Enforces structural grain inspection safeguards to avoid warehouse spoilage.

---

## 🛠️ Environment Configuration

To transition the ecosystem from the integrated sandboxed emulators to active live-production APIs, populate the following parameters in your workspace **Settings → Environment Variables**:



##  Tech Stack & Deployment

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Advanced Google Maps API.
* **Backend**: Express, TypeScript (Bundled via CJS and launched standalone).
* **install Command**: `npm install`
* **Build Command**: `npm run build`
* **Development Command**: `npm run dev` (Runs on Port 3000)
