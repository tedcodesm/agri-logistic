import React from "react";
import { motion } from "motion/react";
import {
  Sprout,
  ShoppingCart,
  ShieldCheck,
  Truck,
  MapPin,
  Building2,
  Banknote,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const FLOW_STEPS = [
  {
    step: 1,
    icon: Sprout,
    title: "Farmer lists produce",
    desc: "Verified farmers publish harvest listings with grade, quantity, and pickup location—via web or USSD.",
    color: "from-emerald-500 to-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  },
  {
    step: 2,
    icon: ShoppingCart,
    title: "Buyer places order",
    desc: "Buyers browse the marketplace, compare prices, and place orders with transparent pricing per kilogram.",
    color: "from-blue-500 to-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
  },
  {
    step: 3,
    icon: ShieldCheck,
    title: "Escrow payment activated",
    desc: "Funds are held securely via PesaPal/M-PESA escrow until delivery is confirmed—protecting both parties.",
    color: "from-amber-500 to-amber-600",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
  {
    step: 4,
    icon: Truck,
    title: "Driver assigned",
    desc: "AI matches the nearest available fleet with cargo capacity, cold-chain requirements, and route efficiency.",
    color: "from-cyan-500 to-cyan-600",
    border: "border-cyan-200",
    bg: "bg-cyan-50",
  },
  {
    step: 5,
    icon: MapPin,
    title: "Live delivery tracking",
    desc: "GPS telemetry streams location, temperature, and ETA to buyers and farmers in real time on the map.",
    color: "from-violet-500 to-violet-600",
    border: "border-violet-200",
    bg: "bg-violet-50",
  },
  {
    step: 6,
    icon: Building2,
    title: "Warehouse verification",
    desc: "Receiving hubs scan moisture, grade produce, and issue digital receipts before final handoff.",
    color: "from-indigo-500 to-indigo-600",
    border: "border-indigo-200",
    bg: "bg-indigo-50",
  },
  {
    step: 7,
    icon: Banknote,
    title: "Payment released",
    desc: "Once proof-of-delivery is verified, escrow releases funds to the farmer and closes the order ledger.",
    color: "from-green-500 to-green-600",
    border: "border-green-200",
    bg: "bg-green-50",
  },
];

interface HowItWorksPageProps {
  onEnterMarketplace: () => void;
}

export default function HowItWorksPage({ onEnterMarketplace }: HowItWorksPageProps) {
  return (
    <div className="overflow-x-hidden">
      <section className="bg-agri-navy py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-agri-emerald/10 border border-agri-emerald/30 text-agri-emerald text-xs font-bold uppercase tracking-widest mb-6">
            End-to-end flow
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight max-w-4xl mx-auto">
            How Agri-Link moves produce from farm to market
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Seven connected steps—each visible to judges and users—with escrow protection and live logistics at every stage.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:block relative mb-8">
            <div className="absolute top-[4.5rem] left-[8%] right-[8%] h-1 bg-gradient-to-r from-emerald-300 via-cyan-300 to-green-300 rounded-full" />
          </div>

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-7 lg:gap-3">
            {FLOW_STEPS.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: idx * 0.06 }}
                className="relative"
              >
                <div className={`rounded-2xl border ${item.border} ${item.bg} p-5 h-full flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-shadow`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg mb-4 relative z-10`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Step {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                {idx < FLOW_STEPS.length - 1 && (
                  <div className="lg:hidden flex justify-center py-2 text-slate-300">
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-slate-900 p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 80 Q 200 20 400 100 T 800 60" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="8 8" />
                <path d="M 100 200 Q 350 150 600 220 T 950 180" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />
              </svg>
            </div>
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                  Visual pipeline for demos & judging
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Every order in Agri-Link carries a status timeline mirroring this flow. Buyers see escrow state;
                  farmers see payout readiness; drivers see assigned legs and proof codes.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FLOW_STEPS.map((s) => (
                  <span
                    key={s.step}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2 px-8 py-4 bg-agri-emerald hover:bg-agri-emerald-dark text-white rounded-full font-bold text-lg transition-all shadow-lg"
            >
              Try the marketplace
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
