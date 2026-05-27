import React from "react";
import { motion } from "motion/react";
import { UserRole } from "../../types/auth";

const ROLES: {
  id: UserRole;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { id: "farmer", label: "Farmer", emoji: "🌾", description: "List harvests & track payouts" },
  { id: "buyer", label: "Buyer", emoji: "🛒", description: "Purchase produce with escrow" },
  { id: "driver", label: "Driver", emoji: "🚛", description: "Manage trips & deliveries" },
  { id: "admin", label: "Admin", emoji: "🛠", description: "Platform oversight & analytics" },
];

interface RoleCardGridProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleCardGrid({ value, onChange }: RoleCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ROLES.map((r) => {
        const selected = value === r.id;
        return (
          <motion.button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 touch-manipulation ${
              selected
                ? "border-agri-emerald bg-emerald-500/10 shadow-[0_0_24px_-4px_rgba(16,185,129,0.45)] scale-[1.02]"
                : "border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/80"
            }`}
          >
            {selected && (
              <span className="absolute inset-0 rounded-2xl ring-2 ring-agri-emerald/40 ring-offset-2 ring-offset-slate-900 pointer-events-none" />
            )}
            <span className="text-2xl block mb-2" aria-hidden>
              {r.emoji}
            </span>
            <span className={`block font-bold text-sm ${selected ? "text-white" : "text-slate-200"}`}>
              {r.label}
            </span>
            <span className="block text-[11px] text-slate-500 mt-1 leading-snug">{r.description}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
