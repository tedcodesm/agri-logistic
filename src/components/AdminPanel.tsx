import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Globe, 
  Database, 
  Radio, 
  Lock, 
  Cpu, 
  Info, 
  BadgeCheck 
} from "lucide-react";
import { Order, ProduceListing, DeliveryTrip } from "../types";
import ArchitectureDocs from "./ArchitectureDocs";

interface AdminPanelProps {
  listings: ProduceListing[];
  orders: Order[];
  activeTrips: DeliveryTrip[];
}

// Chart datasets
const VOLUME_DATA = [
  { crop: "Maize", VolumeKg: 14500, averagePriceKes: 38 },
  { crop: "Potatoes", VolumeKg: 28000, averagePriceKes: 30 },
  { crop: "Avocados", VolumeKg: 9500, averagePriceKes: 72 },
  { crop: "Tomatoes", VolumeKg: 6200, averagePriceKes: 65 },
  { crop: "Beans", VolumeKg: 11200, averagePriceKes: 95 },
  { crop: "Cabbage", VolumeKg: 18400, averagePriceKes: 18 },
];

const REVENUE_TREND = [
  { date: "May 15", CompletedInvoices: 320000, MpesaVolumes: 280000 },
  { date: "May 16", CompletedInvoices: 450000, MpesaVolumes: 410000 },
  { date: "May 17", CompletedInvoices: 590000, MpesaVolumes: 550000 },
  { date: "May 18", CompletedInvoices: 410000, MpesaVolumes: 390000 },
  { date: "May 19", CompletedInvoices: 820000, MpesaVolumes: 780000 },
  { date: "May 20", CompletedInvoices: 950000, MpesaVolumes: 910000 },
  { date: "May 21 (Current)", CompletedInvoices: 1250000, MpesaVolumes: 1180000 },
];

export default function AdminPanel({ listings, orders, activeTrips }: AdminPanelProps) {
  const [showDocs, setShowDocs] = useState<boolean>(true);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCostKes, 0) + 1250000; // adding baseline history
  const activeTripsCount = activeTrips.filter(t => t.status !== "COMPLETED").length;

  return (
    <div id="admin-container" className="space-y-6 font-sans">
      
      {/* SYSTEM METRICS HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* TOTAL FLOW VOLUME */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aggregate Transaction Value</span>
            <strong className="text-slate-800 text-lg font-mono">KES {totalRevenue.toLocaleString()}</strong>
            <span className="text-[10px] block text-emerald-600 font-semibold mt-0.5">✓ M-PESA STK Verified</span>
          </div>
        </div>

        {/* ACTIVE COLD CHAINS TRUCKS */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Live GPS Transits</span>
            <strong className="text-slate-800 text-lg font-mono">{activeTripsCount} Active runs</strong>
            <span className="text-[10px] block text-indigo-500 font-semibold mt-0.5">Dual Redis Socket Link</span>
          </div>
        </div>

        {/* ACTIVE LISTINGS */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-sky-50 text-sky-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Marketplace Inventory</span>
            <strong className="text-slate-800 text-lg font-mono">{listings.length + 42} tons listed</strong>
            <span className="text-[10px] block text-sky-500 font-semibold mt-0.5">Nyandarua Potato Peak</span>
          </div>
        </div>

        {/* DOCKER CLUSTER STATE */}
        <div className="bg-slate-900 p-5 rounded-xl text-white shadow flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Server Pod Node Clusters</span>
            <strong className="text-slate-100 text-sm font-mono">● LIVE (3/3 REPLICAS)</strong>
            <span className="text-[10px] block text-cyan-400 font-serif mt-0.5">Port: 3000 Ingress</span>
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMMODITY CROP VOLUME INDEX (BAR) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="border-b border-slate-50 pb-2 mb-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Market Commodity Index Volumes (Kg)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Aggregate produce registered across Kenya County warehouses</p>
          </div>

          <div className="w-full h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} Kg`} />
                <Legend />
                <Bar dataKey="VolumeKg" fill="#10b981" radius={[4, 4, 0, 0]} name="Listed Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOGISTICS FINANCIAL REVENUE INSIGHTS (AREA) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="border-b border-slate-50 pb-2 mb-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">M-PESA STK Daily Ledger Volume (KES)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Transactional values handled by Safaricom endpoints</p>
          </div>

          <div className="w-full h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="CompletedInvoices" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorInv)" name="Supply Orders" />
                <Area type="monotone" dataKey="MpesaVolumes" stroke="#10b981" fillOpacity={1} fill="url(#colorMp)" name="M-PESA Receipts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RISK ALERTER & INFRASTRUCTURE WATCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* FRAUD DETECTION & INBOUND METRICS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight border-b border-slate-50 pb-2 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              Fraud Prevention & Telemetry Warnings
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-500">
                <Info className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <strong>Rate Limit Warning:</strong> IP Address 197.248.81.42 (Nairobi Node) reached maximum STK calls: 15/min. Triggered temporary sandbox firewall blocking.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-800 border-l-4 border-amber-500">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <strong>Post-Harvest Moisture Hazard:</strong> Grace Wanjiku Potatoes listed moisture content 18.5% (above optimal 12% target). Spoilage forecast in 9 days. Auto-directed to Meru Fans ventilations.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            System uptime score: <strong>99.98%</strong> | Latency to Safaricom Daraja: <strong>48ms</strong>
          </div>
        </div>

        {/* TECHNICAL DETAILS QUICK VIEWER BRIEF */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-amber-400 uppercase tracking-tight flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <Globe className="w-4 h-4 text-sky-400 animate-spin" />
              Agri-Microservices Deployment Trace
            </h4>

            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              The platform utilizes a containerized microservices architecture routing all external client calls via NGINX API gateways to sandboxed services. Data synchronization uses dual local sqlite journals when network drops, automatically tracking coordinates index to re-emit logs inside the multi-pod environment.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-[10.5px]">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">K8S Scaling limits</span>
                <strong className="text-emerald-400">3 - 25 Pod Replicas</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">DB Clustered Index</span>
                <strong className="text-sky-450 text-sky-400">2Sphere Spatial</strong>
              </div>
            </div>
          </div>

          <button
            id="toggle-architecture-btn"
            onClick={() => setShowDocs(!showDocs)}
            className="mt-5 w-full bg-slate-850 border border-slate-800 hover:bg-slate-800 text-amber-400 font-bold py-2 rounded text-xs select-none cursor-pointer"
          >
            {showDocs ? "Fold Deployment Configuration Files" : "Inspect Complete Docker / K8S Specifications"}
          </button>
        </div>

      </div>

      {/* DEV OPS EXHAUSTIVE BLUEPRINTS EXPLORER PANEL */}
      {showDocs && (
        <ArchitectureDocs />
      )}

    </div>
  );
}
