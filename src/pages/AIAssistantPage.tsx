import React, { useState } from "react";
import { motion } from "motion/react";
import {
  BrainCircuit,
  MessageSquare,
  TrendingUp,
  CloudRain,
  Route,
  Languages,
  Sparkles,
  Send,
} from "lucide-react";

interface AIAssistantPageProps {
  onEnterMarketplace: () => void;
}

export default function AIAssistantPage({ onEnterMarketplace }: AIAssistantPageProps) {
  const [demoInput, setDemoInput] = useState("");
  const [demoReply, setDemoReply] = useState<string | null>(null);

  function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!demoInput.trim()) return;
    setDemoReply(
      "Mkulima Intel: Based on current Nairobi demand and Nyandarua supply, Grade A potatoes are trending +8% this week. Recommended listing price: KES 40–44/kg. Spoilage risk low with cold-chain dispatch within 24h."
    );
  }

  return (
    <div>
      <section className="bg-slate-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/30 to-transparent" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
              <BrainCircuit className="w-4 h-4" /> Mkulima Intel AI
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Your AI supply chain co-pilot
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Predictive pricing, spoilage alerts, route optimization, and Swahili-friendly guidance—powered by Gemini and tuned for Kenyan agriculture.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, title: "Market signals", desc: "Demand spikes and fair-price bands per county." },
              { icon: CloudRain, title: "Weather risk", desc: "Harvest and spoilage alerts tied to forecasts." },
              { icon: Route, title: "Route AI", desc: "Fleet dispatch and ETA optimization." },
              { icon: Languages, title: "Swahili NLP", desc: "USSD and chat support for rural farmers." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-xl border border-slate-200"
              >
                <f.icon className="w-6 h-6 text-cyan-600 mb-3" />
                <h3 className="font-bold text-slate-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-agri-navy px-5 py-4 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm">Try Mkulima Intel (demo)</span>
            </div>
            <div className="p-5 flex-1 min-h-[220px] space-y-4">
              {demoReply ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-sm text-slate-700 bg-white rounded-xl p-4 border border-slate-200">{demoReply}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ask about prices, routes, or spoilage risk…
                </p>
              )}
            </div>
            <form onSubmit={handleDemoSubmit} className="p-4 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="e.g. Potato price in Nairobi this week?"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <button type="submit" className="p-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
          <button
            type="button"
            onClick={onEnterMarketplace}
            className="text-agri-emerald font-bold hover:underline"
          >
            Open marketplace with AI insights →
          </button>
        </div>
      </section>
    </div>
  );
}
