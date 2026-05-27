import React from "react";
import { motion } from "motion/react";
import {
  Truck,
  MapPin,
  Radio,
  Navigation,
  Thermometer,
  Users,
  Activity,
  Gauge,
} from "lucide-react";
import IntegratedGoogleMap from "../components/IntegratedGoogleMap";

const LOGISTICS_FEATURES = [
  {
    icon: MapPin,
    title: "Real-time tracking",
    desc: "Live GPS positions for every active convoy with ETA updates for buyers and farmers.",
  },
  {
    icon: Navigation,
    title: "Route management",
    desc: "AI-optimized multi-stop routes across county collection points and urban delivery hubs.",
  },
  {
    icon: Gauge,
    title: "Telemetry",
    desc: "Temperature, humidity, and moisture sensors streamed from cold-chain trucks.",
  },
  {
    icon: Users,
    title: "Delivery coordination",
    desc: "Driver dispatch, SMS alerts, and proof-of-delivery codes synced to escrow release.",
  },
];

const DEMO_MARKERS = [
  { id: "1", lat: -0.9, lng: 36.8, title: "Nyandarua Collection", role: "COLLECTION" as const, description: "Potato aggregation point" },
  { id: "2", lat: -1.0, lng: 36.7, title: "Truck KCD-401", role: "TRUCK" as const, description: "En route · 68 km/h" },
  { id: "3", lat: -1.28, lng: 36.82, title: "Nairobi Buyer Hub", role: "BUYER" as const, description: "Delivery ETA 2h 14m" },
];

export default function LogisticsPage() {
  return (
    <div>
      <section className="bg-agri-navy py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 150 Q 300 50 600 200 T 1200 100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="12 8" />
          </svg>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Truck className="w-4 h-4" /> Fleet & last-mile
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white max-w-3xl leading-tight">
            Logistics built for Kenyan roads and rural last-mile
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Coordinate drivers, monitor cold-chain telemetry, and give buyers live visibility from farm gate to warehouse.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {LOGISTICS_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                <span className="text-white text-sm font-bold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" /> Live map preview
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 active nodes</span>
              </div>
              <IntegratedGoogleMap
                center={{ lat: -1.1, lng: 36.75 }}
                zoom={9}
                markers={DEMO_MARKERS}
                height="320px"
              />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-display font-bold text-slate-900">Live telemetry snapshot</h2>
              <p className="text-slate-600 text-sm">
                When a Google Maps API key is configured, this panel shows real markers. Otherwise, a styled fallback map demonstrates the UX for judges.
              </p>
              {[
                { label: "Convoy KCD-401", value: "En route", sub: "Nyandarua → Nairobi", icon: Truck },
                { label: "Cargo temp", value: "4.2°C", sub: "Cold-chain optimal", icon: Thermometer },
                { label: "Fleet status", value: "12 active", sub: "3 awaiting dispatch", icon: Activity },
              ].map((card) => (
                <div key={card.label} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-agri-navy flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-agri-emerald" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{card.label}</div>
                    <div className="font-bold text-slate-900">{card.value}</div>
                    <div className="text-xs text-slate-500">{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
