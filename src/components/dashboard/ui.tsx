import React from "react";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer } from "recharts";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = "emerald",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "emerald" | "blue" | "amber" | "violet" | "cyan";
}) {
  const accents = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-200",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-600 border-blue-200",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-200",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-600 border-violet-200",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-600 border-cyan-200",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${accents[accent]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-2xl md:text-3xl font-display font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trend && <p className="text-xs font-medium text-emerald-600 mt-2">{trend}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function StatusChip({
  status,
}: {
  status: "pending" | "escrow" | "released" | "disputed" | "transit" | "delivered" | "optimal" | "alert";
}) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    escrow: "bg-blue-50 text-blue-700 border-blue-200",
    released: "bg-emerald-50 text-emerald-700 border-emerald-200",
    disputed: "bg-red-50 text-red-700 border-red-200",
    transit: "bg-cyan-50 text-cyan-700 border-cyan-200",
    delivered: "bg-slate-100 text-slate-700 border-slate-200",
    optimal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    alert: "bg-red-50 text-red-700 border-red-200",
  };
  const labels = {
    pending: "Pending",
    escrow: "Secured in Escrow",
    released: "Released",
    disputed: "Disputed",
    transit: "In Transit",
    delivered: "Delivered",
    optimal: "Optimal",
    alert: "Alert",
  };
  return (
    <span className={`inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">{title}</h1>
        {description && <p className="text-slate-500 mt-1 text-sm md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DashboardCard({
  title,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ActivityFeed({
  items,
}: {
  items: { id: string; title: string; time: string; type?: "info" | "success" | "warning" }[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 text-sm">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              item.type === "success"
                ? "bg-emerald-500"
                : item.type === "warning"
                  ? "bg-amber-500"
                  : "bg-slate-300"
            }`}
          />
          <div>
            <p className="text-slate-800 font-medium">{item.title}</p>
            <p className="text-xs text-slate-400">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Recharts needs explicit height on the parent container. */
export function ChartContainer({
  children,
  className = "h-56 min-h-[200px] w-full",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
}

export function CtaButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "primary"
          ? "px-5 py-2.5 rounded-xl bg-agri-emerald hover:bg-agri-emerald-dark text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          : "px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all"
      }
    >
      {children}
    </button>
  );
}
