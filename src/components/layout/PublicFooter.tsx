import React from "react";
import { Sprout, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";
import { PublicPage, PUBLIC_NAV_LINKS } from "../../types/navigation";

interface PublicFooterProps {
  onNavigate: (page: PublicPage) => void;
  onEnterMarketplace: () => void;
}

export default function PublicFooter({ onNavigate, onEnterMarketplace }: PublicFooterProps) {
  return (
    <footer className="bg-agri-navy border-t border-slate-800 text-slate-400">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-agri-emerald" />
              <span className="text-xl font-bold text-white font-display">Agri-Link</span>
            </div>
            <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
              Connecting Kenyan farmers, buyers, and transporters through escrow-backed trade,
              live logistics, and AI-powered supply chain intelligence.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@agrilink.co.ke" className="flex items-center gap-2 hover:text-agri-emerald transition-colors">
                <Mail className="w-4 h-4 text-agri-emerald" /> hello@agrilink.co.ke
              </a>
              <a href="tel:+254700123456" className="flex items-center gap-2 hover:text-agri-emerald transition-colors">
                <Phone className="w-4 h-4 text-agri-emerald" /> +254 700 123 456
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-agri-emerald" /> Westlands, Nairobi, Kenya
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Explore</h4>
            <ul className="space-y-2 text-sm">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-agri-emerald transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Get Started</h4>
            <p className="text-sm text-slate-500 mb-4">
              Browse verified produce, pay via secure escrow, and track deliveries in real time.
            </p>
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="text-sm font-bold text-agri-emerald hover:text-white transition-colors"
            >
              Enter Marketplace →
            </button>
            <div className="flex gap-3 mt-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
          <p>© 2026 Agri-Link Logistics OS. All rights reserved.</p>
          <div className="flex gap-6">
            <button type="button" onClick={() => onNavigate("about")} className="hover:text-white transition-colors">Privacy</button>
            <button type="button" onClick={() => onNavigate("about")} className="hover:text-white transition-colors">Terms</button>
            <button type="button" onClick={() => onNavigate("contact")} className="hover:text-white transition-colors">Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
