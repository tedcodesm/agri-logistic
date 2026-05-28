import React from "react";
import { motion } from "motion/react";
import {
  Truck,
  MapPin,
  Navigation,
  Users,
  Gauge,
} from "lucide-react";
import LiveLogisticsSimulation from "../components/logistics/LiveLogisticsSimulation";

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

          <LiveLogisticsSimulation />
        </div>
      </section>
    </div>
  );
}
