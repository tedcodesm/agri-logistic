import React, { useState } from "react";
import { Sprout, Menu, X, ChevronRight } from "lucide-react";
import { PublicPage, PUBLIC_NAV_LINKS } from "../../types/navigation";

interface PublicNavbarProps {
  currentPage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  onEnterMarketplace: () => void;
  onLogin: () => void;
  currentUser?: { name: string; role: string } | null;
  onSignOut?: () => void;
}

export default function PublicNavbar({
  currentPage,
  onNavigate,
  onEnterMarketplace,
  onLogin,
  currentUser,
  onSignOut,
}: PublicNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(page: PublicPage) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <header className="bg-agri-navy/95 border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">
          <button
            type="button"
            onClick={() => go("landing")}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="p-2 bg-gradient-to-br from-agri-emerald to-agri-emerald-dark rounded-xl text-white shadow-lg shadow-agri-emerald/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-white tracking-tight font-display leading-tight block">
                Agri<span className="text-agri-emerald">Link</span>
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium hidden sm:block">
                Kenya Agri-Logistics
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === link.id
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/50 pl-3 pr-2 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-xs text-slate-200 font-medium">{currentUser.name}</span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-[10px] text-slate-400 hover:text-red-400 px-2"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Log In
              </button>
            )}
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-1.5 bg-agri-emerald hover:bg-agri-emerald-dark text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-agri-emerald/20"
            >
              Open Marketplace
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-800 py-4 space-y-1 pb-5">
            {PUBLIC_NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold ${
                  currentPage === link.id
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 px-4 flex flex-col gap-2 border-t border-slate-800 mt-2">
              {!currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    onLogin();
                    setMobileOpen(false);
                  }}
                  className="w-full py-3 text-sm font-semibold text-slate-300 border border-slate-700 rounded-xl"
                >
                  Log In
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onEnterMarketplace();
                  setMobileOpen(false);
                }}
                className="w-full py-3 bg-agri-emerald text-white text-sm font-bold rounded-xl"
              >
                Open Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
