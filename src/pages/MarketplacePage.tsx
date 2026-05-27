import React from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  ShieldCheck,
  Scale,
  Search,
  ArrowRight,
  CheckCircle,
  Leaf,
  BarChart3,
} from "lucide-react";

interface MarketplacePageProps {
  onEnterMarketplace: () => void;
}

export default function MarketplacePage({ onEnterMarketplace }: MarketplacePageProps) {
  return (
    <div>
      <section className="bg-gradient-to-br from-agri-navy via-agri-navy-light to-slate-900 py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            <ShoppingBag className="w-4 h-4" /> Verified produce marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white max-w-3xl mx-auto leading-tight">
            Trade agricultural produce with confidence
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Browse grade-certified listings from Kenyan farmers. Every purchase is backed by escrow until delivery is confirmed.
          </p>
          <button
            type="button"
            onClick={onEnterMarketplace}
            className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-agri-emerald hover:bg-agri-emerald-dark text-white rounded-full font-bold text-lg shadow-xl"
          >
            Launch live marketplace
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: "Smart discovery", desc: "Filter by crop, county, grade, and available tonnage." },
              { icon: Scale, title: "Fair pricing", desc: "Transparent KES/kg rates with market benchmarks." },
              { icon: ShieldCheck, title: "Escrow protected", desc: "PesaPal holds funds until delivery proof is verified." },
              { icon: BarChart3, title: "Order history", desc: "Track purchases, payments, and cargo status in one dashboard." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:shadow-lg transition-shadow"
              >
                <f.icon className="w-8 h-8 text-agri-emerald mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">What buyers get</h2>
              <ul className="space-y-4">
                {[
                  "Grade A/B/C certification on every listing",
                  "M-PESA STK and PesaPal checkout integration",
                  "SMS confirmations via Africa's Talking",
                  "Automatic logistics dispatch after payment",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-agri-emerald shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-2xl">
              <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                <Leaf className="w-4 h-4 text-agri-emerald" /> Sample listings
              </div>
              {[
                { crop: "Irish Potatoes", county: "Nyandarua", qty: "2.4T", price: "KES 42/kg" },
                { crop: "Green Maize", county: "Uasin Gishu", qty: "5.1T", price: "KES 28/kg" },
                { crop: "French Beans", county: "Meru", qty: "800kg", price: "KES 95/kg" },
              ].map((row) => (
                <div key={row.crop} className="flex justify-between items-center py-4 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="font-bold">{row.crop}</div>
                    <div className="text-xs text-slate-500">{row.county}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-agri-emerald font-mono text-sm font-bold">{row.price}</div>
                    <div className="text-xs text-slate-500">{row.qty} available</div>
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
