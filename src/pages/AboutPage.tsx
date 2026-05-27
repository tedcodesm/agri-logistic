import React from "react";
import { motion } from "motion/react";
import { Target, Heart, Sprout, TrendingDown, Users, Globe2, ShieldCheck } from "lucide-react";

const IMPACT_STATS = [
  { value: "24,500+", label: "Farmers connected", icon: Sprout },
  { value: "42%", label: "Post-harvest loss reduced", icon: TrendingDown },
  { value: "18.2K", label: "Metric tons moved", icon: Globe2 },
  { value: "KES 580M+", label: "Escrow volume processed", icon: ShieldCheck },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-agri-emerald/10 to-white py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
            Building the digital backbone of Kenya&apos;s food supply chain
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Agri-Link exists because farmers lose too much after harvest—and buyers lack trust, visibility, and fair logistics.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">The problem we&apos;re solving</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Up to 40% of fresh produce in Kenya never reaches buyers at fair value. Middlemen capture margins,
              payments are delayed or disputed, and logistics is fragmented across informal transporters with no telemetry.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Smallholder farmers in counties like Nyandarua, Meru, and Uasin Gishu need direct market access,
              secure payments, and cold-chain coordination—not another paper receipt at a roadside depot.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">Why Kenya needs this now</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Agriculture employs most Kenyans and feeds the region, yet digital infrastructure lags behind fintech.
              M-PESA solved payments; Agri-Link solves the <strong className="text-slate-800">movement of trust and produce</strong>—escrow,
              grading, warehousing, and live fleet data in one OS.
            </p>
            <p className="text-slate-600 leading-relaxed">
              With 47 counties and growing urban demand, coordinating farm-to-city logistics at scale requires
              a platform built for Kenyan roads, languages, and payment rails.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-agri-navy text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-agri-emerald" />
            <h2 className="text-2xl font-display font-bold">Mission statement</h2>
          </div>
          <blockquote className="text-xl md:text-2xl font-display leading-relaxed text-slate-200 border-l-4 border-agri-emerald pl-6 max-w-4xl">
            To eliminate preventable post-harvest loss and unlock fair, transparent trade for every Kenyan farmer,
            buyer, and transporter—powered by AI, escrow, and real-time logistics.
          </blockquote>
          <div className="mt-10 flex items-start gap-3 max-w-2xl">
            <Heart className="w-6 h-6 text-agri-emerald shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">Our vision</h3>
              <p className="text-slate-400 leading-relaxed">
                An Africa where agricultural logistics runs on open, intelligent infrastructure—so food moves efficiently
                from rural aggregation to urban markets, and farmers capture the value they grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900">Impact statistics</h2>
            <p className="text-slate-500 mt-2">Platform metrics from pilot counties and partner networks</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm"
              >
                <stat.icon className="w-8 h-8 text-agri-emerald mx-auto mb-3" />
                <div className="text-3xl font-display font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Users className="w-4 h-4" />
            Serving farmers, buyers, drivers, and warehouses across Kenya
          </div>
        </div>
      </section>
    </div>
  );
}
