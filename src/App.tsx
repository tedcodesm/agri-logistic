import React, { useState } from "react";
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Building2, 
  BarChart3, 
  MapPin, 
  Award, 
  CheckCircle,
  Clock,
  ChevronRight
} from "lucide-react";

import { 
  Farmer, 
  Buyer, 
  Driver, 
  Vehicle, 
  Warehouse, 
  ProduceListing, 
  DeliveryTrip, 
  Order, 
  ProduceGrade,
  CargoStatus,
  PaymentStatus
} from "./types";

import { 
  SEED_FARMERS, 
  SEED_BUYERS, 
  SEED_DRIVERS, 
  SEED_VEHICLES, 
  SEED_WAREHOUSES, 
  SEED_LISTINGS, 
  SEED_ORDERS 
} from "./data";

import FarmersPanel from "./components/FarmersPanel";
import BuyersPanel from "./components/BuyersPanel";
import AuthModal from "./components/AuthModal";
import CommunicationsModal from "./components/CommunicationsModal";

import DriversPanel from "./components/DriversPanel";
import WarehousesPanel from "./components/WarehousesPanel";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./components/LandingPage";
import PublicLayout from "./components/layout/PublicLayout";
import HowItWorksPage from "./pages/HowItWorksPage";
import MarketplacePage from "./pages/MarketplacePage";
import AIAssistantPage from "./pages/AIAssistantPage";
import LogisticsPage from "./pages/LogisticsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import { AppView, isPublicPage, PublicPage } from "./types/navigation";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppView>("landing");

  function navigatePublic(page: PublicPage) {
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enterMarketplace() {
    setActiveTab("buyer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // MongoDB User Session States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCommsModal, setShowCommsModal] = useState<boolean>(false);

  const showWorkspaceNav =
    !isPublicPage(activeTab) &&
    (currentUser?.role === "farmer" ||
      currentUser?.role === "driver" ||
      currentUser?.role === "admin" ||
      activeTab === "warehouse" ||
      activeTab === "admin");

  // Core Application Shared State
  const [farmers, setFarmers] = useState<Farmer[]>(SEED_FARMERS);
  const [buyers, setBuyers] = useState<Buyer[]>(SEED_BUYERS);
  const [drivers, setDrivers] = useState<Driver[]>(SEED_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [listings, setListings] = useState<ProduceListing[]>(SEED_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [activeTrips, setActiveTrips] = useState<DeliveryTrip[]>([]);

  // 1. Farmer Actions
  function addListing(newListing: ProduceListing) {
    setListings([newListing, ...listings]);
  }

  function syncListings(localListings: ProduceListing[]) {
    // Incorporate listings synced back from local SQLite buffers on connectivity re-establish
    const synced = localListings.map(item => ({ ...item, syncStatus: "SYNCED" as any }));
    setListings([...synced, ...listings]);
    alert(`⚡ Cloud DB Link Sync complete. ${localListings.length} locally queued harvests listed successfully!`);
  }

  // 2. Buyer Actions
  function placeOrder(newOrder: Order) {
    setOrders([newOrder, ...orders]);
    alert(`🎉 Purchase verified. Secure STK payment callback verified.`);

    // Deduct listings volume immediately from available market inventory
    const purchasedIds = newOrder.listingIds;
    setListings(prev => 
      prev.map(item => {
        if (purchasedIds.includes(item.id)) {
          // Reduce quantities or mark sold
          return { ...item, quantityKg: Math.max(0, item.quantityKg - newOrder.totalQuantityKg) };
        }
        return item;
      }).filter(item => item.quantityKg > 0)
    );

    // Automatic push notification for buyer via Africa's Talking
    const targetBuyer = buyers.find(b => b.id === newOrder.buyerId);
    if (targetBuyer) {
      const normalizedPhone = targetBuyer.phoneNumber.replace(/\s+/g, "");
      fetch("/api/africastalking/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalizedPhone,
          message: `AgriLogistics: Hello ${targetBuyer.name}, your agricultural purchase order #${newOrder.id} of ${newOrder.totalQuantityKg}Kg has been verified successfully. PesaPal escrow clearing initiated.`
        })
      }).catch(err => console.log("Auto SMS dispatch failed:", err));
    }
  }

  // 3. Driver Actions
  function addTrip(newTrip: DeliveryTrip) {
    setActiveTrips([newTrip, ...activeTrips]);
    
    // Update order status to packing/truck filling
    setOrders(prev => 
      prev.map(o => o.id === newTrip.orderId ? { ...o, status: CargoStatus.AGGREGATED } : o)
    );

    // Automatic dispatch alert for driver via Africa's Talking
    const targetDriver = drivers.find(d => d.id === newTrip.driverId);
    if (targetDriver) {
      const normalizedPhone = targetDriver.phoneNumber.replace(/\s+/g, "");
      fetch("/api/africastalking/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalizedPhone,
          message: `Transit Run: Jambo Driver ${targetDriver.name}! You are dispatched to cargo trip #${newTrip.id}. Vehicle plate: ${newTrip.vehicleId}. Proceed to collection viewpoint coordinate logs.`
        })
      }).catch(err => console.log("Auto Driver SMS dispatch failed:", err));
    }
  }

  function updateTripIndex(tripId: string, idx: number, fuelConsumed: number) {
    setActiveTrips(prev => 
      prev.map(t => {
        if (t.id === tripId) {
          // Dynamic waypoints completion checks as truck shifts indexes
          const updatedWaypoints = t.waypoints.map((w, wIdx) => {
            if (idx >= (wIdx + 1) * 5) return { ...w, completed: true };
            return w;
          });
          return { 
            ...t, 
            currentLocationIndex: idx, 
            fuelConsumedLiters: fuelConsumed,
            waypoints: updatedWaypoints
          };
        }
        return t;
      })
    );
  }

  function completeTrip(tripId: string, proofCode: string) {
    const targetTrip = activeTrips.find(t => t.id === tripId);
    if (!targetTrip) return;

    setActiveTrips(prev => 
      prev.map(t => t.id === tripId ? { ...t, status: "COMPLETED", deliveryProofCode: proofCode } : t)
    );

    // Update global supply order cargo status
    setOrders(prev => 
      prev.map(o => o.id === targetTrip.orderId ? { ...o, status: CargoStatus.DELIVERED } : o)
    );

    // Flow produce weight directly into receiving warehouse holdings
    const associatedOrder = orders.find(o => o.id === targetTrip.orderId);
    if (associatedOrder) {
      setWarehouses(prev => 
        prev.map(w => {
          // Arbitrary allocation into Nyandarua potato depository for simulation validation
          if (w.id === "W-501") {
            return {
              ...w,
              currentOccupancyKg: Math.min(w.totalCapacityKg, w.currentOccupancyKg + associatedOrder.totalQuantityKg),
              gradeDistribution: {
                ...w.gradeDistribution,
                [ProduceGrade.GRADE_A]: w.gradeDistribution[ProduceGrade.GRADE_A] + associatedOrder.totalQuantityKg
              }
            };
          }
          return w;
        })
      );
    }
    alert(`📦 Proof Verified. Receipt Registered in Ledger. Cold storage database holdings synchronized.`);
  }

  // 4. Warehouse Actions
  function adjustClimate(warehouseId: string, tempDelta: number, humDelta: number) {
    setWarehouses(prev => 
      prev.map(w => {
        if (w.id === warehouseId) {
          return {
            ...w,
            temperatureCelsius: Math.max(1.0, w.temperatureCelsius + tempDelta),
            humidityPct: Math.max(5.0, Math.min(99.0, w.humidityPct + humDelta))
          };
        }
        return w;
      })
    );
  }

  function renderPublicPage() {
    const page = activeTab as PublicPage;
    switch (page) {
      case "how-it-works":
        return <HowItWorksPage onEnterMarketplace={enterMarketplace} />;
      case "marketplace":
        return <MarketplacePage onEnterMarketplace={enterMarketplace} />;
      case "ai-assistant":
        return <AIAssistantPage onEnterMarketplace={enterMarketplace} />;
      case "logistics":
        return <LogisticsPage />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "landing":
      default:
        return <LandingPage onEnterMarketplace={enterMarketplace} onNavigate={navigatePublic} />;
    }
  }

  if (isPublicPage(activeTab)) {
    return (
      <div className="min-h-screen antialiased font-sans">
        <PublicLayout
          currentPage={activeTab}
          onNavigate={navigatePublic}
          onEnterMarketplace={enterMarketplace}
          onLogin={() => setShowAuthModal(true)}
          currentUser={currentUser}
          onSignOut={() => setCurrentUser(null)}
        >
          {renderPublicPage()}
        </PublicLayout>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setShowAuthModal(false);
              if (user.role === "farmer") setActiveTab("farmer");
              else if (user.role === "buyer") setActiveTab("buyer");
              else if (user.role === "driver") setActiveTab("driver");
              else if (user.role === "admin") setActiveTab("admin");
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased font-sans">
      
      {/* WORKSPACE HEADER (buyer marketplace & role-based ops) */}
      <header className="bg-agri-navy border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-md">
        <div id="desktop-nav-header" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigatePublic("landing")}
          >
            <div className="p-2.5 bg-gradient-to-br from-agri-emerald to-agri-emerald-dark rounded-xl text-white shadow-lg shadow-agri-emerald/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5 font-display leading-tight">
                Agri<span className="text-agri-emerald">Link</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-sans uppercase tracking-widest font-medium">
                Marketplace
              </p>
            </div>
          </div>

          {activeTab === "buyer" && (
            <div className="hidden md:flex flex-1 justify-center items-center gap-6 text-sm font-semibold text-slate-300">
              <button type="button" onClick={() => navigatePublic("how-it-works")} className="hover:text-white transition-colors">How It Works</button>
              <button type="button" onClick={() => navigatePublic("logistics")} className="hover:text-white transition-colors">Logistics</button>
              <button type="button" onClick={() => navigatePublic("contact")} className="hover:text-white transition-colors">Support</button>
            </div>
          )}

          {activeTab !== "buyer" && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Vol:</span>
              <strong className="text-xs text-white font-mono">{(listings.reduce((sum, l) => sum + l.quantityKg, 0) / 1000).toFixed(1)}T</strong>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Runs:</span>
              <strong className="text-xs text-white font-mono">{activeTrips.length}</strong>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Moisture:</span>
              <strong className="text-xs text-white font-mono">&lt;13.5%</strong>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Escrow:</span>
              <strong className="text-xs text-white font-mono">KES {(orders.reduce((sum, o) => sum + o.totalCostKes, 0)).toLocaleString()}</strong>
            </div>
            </div>
          )}

          {/* User & Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/30 rounded-full border border-slate-700/50">
              <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B1120]"></div>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/40 hover:bg-slate-800/60 transition-all p-1.5 pl-3 pr-2.5 rounded-full border border-slate-700/50 cursor-pointer">
                <div className="flex flex-col items-end">
                  <div className="font-semibold text-slate-100 text-xs leading-none">{currentUser.name}</div>
                  <div className="text-[9px] text-emerald-400 capitalize mt-1 font-medium">{currentUser.role} Account</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 text-white font-bold flex items-center justify-center uppercase border border-slate-400/20 shadow-sm">
                  {currentUser.name[0]}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentUser(null);
                  }}
                  className="ml-1 p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg shadow-white/10"
              >
               Log In 
              </button>
            )}
          </div>

        </div>
      </header>


      {showWorkspaceNav && (
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-start gap-4 py-0 overflow-x-auto no-scrollbar">
          
          <button
            id="tab-farmer-btn"
            onClick={() => setActiveTab("farmer")}
            className={`flex items-center gap-2 px-2 py-4 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "farmer" 
                ? "border-emerald-500 text-emerald-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Sprout className="w-4 h-4" />
            Farmer Hub
            {activeTab === "farmer" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 shadow-[0_-2px_10px_rgba(16,185,129,0.5)]"></div>}
          </button>

          <button
            id="tab-buyer-btn"
            onClick={() => setActiveTab("buyer")}
            className={`flex items-center gap-2 px-2 py-4 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "buyer" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Marketplace
            {activeTab === "buyer" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
          </button>

          <button
            id="tab-driver-btn"
            onClick={() => setActiveTab("driver")}
            className={`flex items-center gap-2 px-2 py-4 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "driver" 
                ? "border-amber-500 text-amber-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Truck className="w-4 h-4" />
            Fleet & Transit
            {activeTab === "driver" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500 shadow-[0_-2px_10px_rgba(245,158,11,0.5)]"></div>}
          </button>

          <button
            id="tab-warehouse-btn"
            onClick={() => setActiveTab("warehouse")}
            className={`flex items-center gap-2 px-2 py-4 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "warehouse" 
                ? "border-indigo-500 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Warehousing
            {activeTab === "warehouse" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"></div>}
          </button>

          <button
            id="tab-admin-btn"
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-2 py-4 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "admin" 
                ? "border-slate-800 text-slate-900" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Command Center
            {activeTab === "admin" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-800 shadow-[0_-2px_10px_rgba(30,41,59,0.5)]"></div>}
          </button>

        </div>
      </nav>
      )}

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === "farmer" && (
          <FarmersPanel 
            farmers={farmers}
            listings={listings}
            onAddListing={addListing}
            onSyncListings={syncListings}
          />
        )}

        {activeTab === "buyer" && (
          <BuyersPanel 
            buyers={buyers}
            listings={listings}
            orders={orders}
            onPlaceOrder={placeOrder}
          />
        )}

        {activeTab === "driver" && (
          <DriversPanel 
            drivers={drivers}
            vehicles={vehicles}
            orders={orders}
            activeTrips={activeTrips}
            onAddTrip={addTrip}
            onUpdateTripIndex={updateTripIndex}
            onCompleteTrip={completeTrip}
          />
        )}

        {activeTab === "warehouse" && (
          <WarehousesPanel 
            warehouses={warehouses}
            onAdjustClimate={adjustClimate}
          />
        )}

        {activeTab === "admin" && (
          <AdminPanel 
            listings={listings}
            orders={orders}
            activeTrips={activeTrips}
          />
        )}

      </main>

      {activeTab === "buyer" && (
      <section className="py-16 bg-gradient-to-br from-agri-emerald-dark to-agri-navy text-center px-4 border-t border-slate-200">
         <h2 className="text-2xl font-display font-bold text-white mb-4">Questions about your order?</h2>
         <p className="text-agri-emerald-100 mb-6 max-w-lg mx-auto">Visit our How It Works or Contact pages from the site menu.</p>
         <button type="button" onClick={() => navigatePublic("contact")} className="px-8 py-3 bg-white text-agri-navy hover:bg-slate-100 rounded-full font-bold transition-all inline-flex items-center gap-2">
            Contact support <ChevronRight className="w-5 h-5" />
         </button>
      </section>
      )}

      <footer className="bg-agri-navy border-t border-slate-800 text-slate-400 py-8">
        <div className="max-w-screen-2xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <button type="button" onClick={() => navigatePublic("landing")} className="flex items-center gap-2 hover:text-white">
            <Sprout className="w-4 h-4 text-agri-emerald" />
            <span>Back to Agri-Link home</span>
          </button>
          <p>© 2026 Agri-Link Logistics OS</p>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            // Switch tabs dynamically based on user role when logged in to focus their workspace!
            if (user.role === "farmer") setActiveTab("farmer");
            if (user.role === "buyer") setActiveTab("buyer");
            if (user.role === "driver") setActiveTab("driver");
            if (user.role === "admin") setActiveTab("admin");
          }}
        />
      )}

      {showCommsModal && (
        <CommunicationsModal
          onClose={() => setShowCommsModal(false)}
          farmers={farmers}
          buyers={buyers}
          drivers={drivers}
        />
      )}

    </div>
  );
}

