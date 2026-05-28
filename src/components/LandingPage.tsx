import React from "react";
import { motion } from "motion/react";
import { 
  Sprout, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  BrainCircuit,
  PackageCheck,
  ChevronRight,
  BarChart3,
  Globe2,
  Leaf,
  Layers,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";

import { PublicPage } from "../types/navigation";

interface LandingPageProps {
  onEnterMarketplace: () => void;
  onNavigate: (page: PublicPage) => void;
}

export default function LandingPage({ onEnterMarketplace, onNavigate }: LandingPageProps) {
  return (
    <div className="overflow-x-hidden font-sans text-slate-800">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-agri-navy">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          {/* Faux animated map routes */}
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
             <path d="M 100 200 Q 300 50 600 300 T 1200 100" fill="transparent" stroke="#10b981" strokeWidth="2" strokeDasharray="10 10" className="animate-pulse" />
             <path d="M 200 500 Q 400 350 800 600 T 1400 400" fill="transparent" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-agri-emerald/10 border border-agri-emerald/20 text-agri-emerald font-semibold text-xs uppercase tracking-widest mb-6"
            >
              <Activity className="w-4 h-4" /> Live in 47 Counties
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight font-display"
            >
              AI-Powered Logistics for Smarter Agricultural Trade
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Agri-Link connects farmers, buyers, and transporters through an AI-powered supply chain coordination platform. Reduce post-harvest loss and trade with confidence.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                type="button"
                onClick={onEnterMarketplace}
                className="px-8 py-4 bg-agri-emerald hover:bg-agri-emerald-dark text-white rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 group"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                type="button"
                onClick={() => onNavigate("logistics")}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Truck className="w-5 h-5 text-agri-cyan" /> Track Logistics
              </button>
            </motion.div>
          </div>

          {/* Logistics Command Center Preview Faux-UI */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-agri-navy via-transparent to-transparent z-10 bottom-0 h-40 mt-auto"></div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/3 border-r border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-agri-emerald/20 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-agri-emerald" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-bold">Convoy KCD-{i}00</div>
                          <div className="text-slate-400 text-[10px]">En route to Nairobi</div>
                        </div>
                      </div>
                      <div className="text-agri-cyan text-xs font-mono font-bold">120km</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-2/3 bg-[#0a0a0a] p-6 relative">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                 <div className="relative z-10">
                   <h3 className="text-white font-display font-bold flex items-center gap-2"><MapPin className="text-agri-emerald" /> Live Telemetry</h3>
                   <div className="mt-8 flex gap-4">
                     <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-48">
                        <div className="text-slate-400 text-xs mb-1 uppercase tracking-widest">Temperature</div>
                        <div className="text-2xl font-mono text-white font-bold">4.2°C</div>
                        <div className="text-agri-emerald text-[10px] mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Optimal</div>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-48">
                        <div className="text-slate-400 text-xs mb-1 uppercase tracking-widest">Moisture</div>
                        <div className="text-2xl font-mono text-white font-bold">12.8%</div>
                        <div className="text-agri-emerald text-[10px] mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Safe Grade</div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Interactive Supply Chain Visualization & 6. Rural Last-Mile */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900">Seamless Supply Ecosystem</h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">From rural aggregation to last-mile urban delivery, we orchestrate every node with precision.</p>
          </div>

          <div className="relative">
             {/* Connection Line */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-200 via-blue-200 to-amber-200 -translate-y-1/2 z-0"></div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
               {[
                 { icon: Sprout, title: "Farm Level", desc: "Farmers log yields and lock pre-harvest contracts via USSD or Web.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                 { icon: Layers, title: "Aggregation", desc: "Rural collection points verify quality using moisture scanners and issue digital receipts.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                 { icon: Truck, title: "Logistics", desc: "AI dispatches optimized transport. Cold-chain trucks track temperature in transit.", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
                 { icon: PackageCheck, title: "Market", desc: "Buyers receive certified produce with smart escrow release upon delivery.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
               ].map((step, idx) => (
                 <motion.div 
                   key={idx}
                   whileHover={{ y: -10 }}
                   className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center"
                 >
                   <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.border} border flex items-center justify-center mb-6`}>
                     <step.icon className={`w-8 h-8 ${step.color}`} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                 </motion.div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* 4. AI Intelligence Section — “Mkulima Intel” */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-agri-navy to-transparent"></div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-6">
                <BrainCircuit className="w-4 h-4" /> Mkulima Intel AI
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">Predictive intelligence for supply chain stability.</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Our AI engine analyzes weather patterns, market demand, and transport routes to predict spoilage risks and optimize pricing across 47 counties.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Dynamic route optimization for fleet drivers",
                  "Market price prediction and anomaly alerts",
                  "Swahili NLP integration for rural farmers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
               {/* Dashboard Mockup */}
               <div className="bg-agri-navy-light rounded-2xl border border-slate-800 p-6 shadow-2xl">
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                   <div className="font-bold text-sm text-slate-200">Intelligence Feed</div>
                   <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                 </div>
                 <div className="space-y-4">
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                     <div className="flex justify-between items-start">
                       <div className="flex gap-3">
                         <div className="p-2 bg-amber-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-500"/></div>
                         <div>
                           <div className="text-white text-sm font-bold">Demand Spike Detected</div>
                           <div className="text-slate-400 text-xs mt-1">Maize in Nairobi (+12%)</div>
                         </div>
                       </div>
                       <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-1 rounded">High Impact</span>
                     </div>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                     <div className="flex justify-between items-start">
                       <div className="flex gap-3">
                         <div className="p-2 bg-red-500/10 rounded-lg"><Activity className="w-5 h-5 text-red-500"/></div>
                         <div>
                           <div className="text-white text-sm font-bold">Spoilage Risk Alert</div>
                           <div className="text-slate-400 text-xs mt-1">Kisumu Warehouse • Humidity High</div>
                         </div>
                       </div>
                       <span className="text-[10px] text-red-400 font-mono bg-red-400/10 px-2 py-1 rounded">Action Needed</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Impact Metrics Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Farmers Connected", value: "24,500+", icon: Sprout, color: "text-emerald-600" },
              { label: "Metric Tons Moved", value: "18.2K", icon: Globe2, color: "text-blue-600" },
              { label: "Post-Harvest Loss Red.", value: "-42%", icon: Leaf, color: "text-green-600" },
              { label: "Escrow Volume", value: "$4.2M", icon: ShieldCheck, color: "text-amber-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color} opacity-80`} />
                <div className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Trust & Security Section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">Fintech-Grade Security for Agriculture</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16">
            We've integrated directly with M-PESA and major banking partners to provide seamless escrow payments, protecting both farmers and buyers.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mocked logos of partners */}
             <div className="text-2xl font-bold font-display text-emerald-600 flex items-center gap-2"><Zap className="w-8 h-8"/> M-PESA</div>
             <div className="text-2xl font-bold font-display text-blue-800 flex items-center gap-2"><ShieldCheck className="w-8 h-8"/> PesaPal</div>
             <div className="text-2xl font-bold font-display text-indigo-600 flex items-center gap-2"><Activity className="w-8 h-8"/> Equity</div>
             <div className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2"><Globe2 className="w-8 h-8"/> Stripe</div>
          </div>
        </div>
      </section>
    </div>
  );
}
