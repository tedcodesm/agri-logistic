import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Sprout, Bell, Search, Settings, LogOut, Menu, X, MapPin, Radio } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/auth";
import { getNavItems } from "../../dashboards/navConfig";
import { useDashboardData } from "../../context/DashboardDataContext";

interface DashboardLayoutProps {
  role: UserRole;
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { currentFarmer, currentBuyer, currentDriver } = useDashboardData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(role);
  const base = `/dashboard/${role}`;
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarLetter = (displayName[0] || "A").toUpperCase();
  const region =
    role === "farmer"
      ? currentFarmer.location.county
      : role === "buyer"
        ? currentBuyer.location.city
        : role === "driver"
          ? "On route · Kenya"
          : "Kenya";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-agri-navy border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-agri-emerald to-emerald-700">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white">
              Agri<span className="text-agri-emerald">Link</span>
            </span>
          </button>
          <button type="button" className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`${base}/${item.path}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-agri-emerald/15 text-agri-emerald border border-agri-emerald/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-slate-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search orders, crops, routes…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/20"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-agri-emerald" />
                {region}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
              <button type="button" className="relative p-2 rounded-xl hover:bg-slate-100">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{displayName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{role}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-agri-emerald to-cyan-600 text-white font-bold flex items-center justify-center text-sm">
                  {avatarLetter}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
