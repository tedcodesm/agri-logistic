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
  Clock
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

export default function App() {
  // Nav Tab State
  const [activeTab, setActiveTab] = useState<"farmer" | "buyer" | "driver" | "warehouse" | "admin">("farmer");

  // MongoDB User Session States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCommsModal, setShowCommsModal] = useState<boolean>(false);


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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      
      {/* GLOBAL BRAND WORKSPACE HEADER */}
      <header className="bg-slate-900 border-b border-slate-850 sticky top-0 z-55">
        <div id="desktop-nav-header" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-sm shadow-emerald-500/10">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                Agri
              </h1>
              <p className="text-[10.5px] text-slate-400 font-sans uppercase tracking-widest">
                Rural Connectivity & Supply Chain Coordinator
              </p>
            </div>
          </div>

          {/* Core metrics tracker bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span>Inventory: <strong>{(listings.reduce((sum, l) => sum + l.quantityKg, 0) / 1000).toFixed(1)} T</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Dispatched Runs: <strong>{activeTrips.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Moisture Limit: <strong>&lt;13.5%</strong></span>
            </div>
          </div>

          {/* MongoDB Authentication status */}
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setShowCommsModal(true)}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:border-amber-500/60"
              title="Access Africa's Talking Voice Call & SMS Alert system"
            >
              📢 AT communications hub
            </button> */}

            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-slate-950 p-1.5 pl-3 pr-2.5 rounded-xl border border-slate-800 text-xs font-sans">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center uppercase">
                  {currentUser.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-100 leading-none">{currentUser.name}</div>
                  <div className="text-[9.5px] text-slate-400 capitalize mt-0.5">{currentUser.role} • Sync Node</div>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    alert("Account signed out. Local buffers reset.");
                  }}
                  className="ml-2 text-[9px] bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 font-bold px-2 py-1 rounded cursor-pointer transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Integrate database user systems using Mongo accounts"
              >
               Sign In 
              </button>
            )}
          </div>

        </div>
      </header>


      {/* HORIZONTAL SECONDARY WORKSPACE NAVIGATION */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-start gap-1 py-1 px-1 overflow-x-auto">
          
          <button
            id="tab-farmer-btn"
            onClick={() => setActiveTab("farmer")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "farmer" 
                ? "border-emerald-500 text-emerald-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sprout className="w-4 h-4" />
            Farmer Workspace
          </button>

          <button
            id="tab-buyer-btn"
            onClick={() => setActiveTab("buyer")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "buyer" 
                ? "border-sky-500 text-sky-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Wholesale Marketplace
          </button>

          <button
            id="tab-driver-btn"
            onClick={() => setActiveTab("driver")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "driver" 
                ? "border-amber-500 text-amber-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            Logistics & GPS Routing
          </button>

          <button
            id="tab-warehouse-btn"
            onClick={() => setActiveTab("warehouse")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "warehouse" 
                ? "border-indigo-500 text-indigo-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Cold Warehousing
          </button>

          <button
            id="tab-admin-btn"
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "admin" 
                ? "border-slate-800 text-slate-900 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Operator Intelligence & DevOps
          </button>

        </div>
      </nav>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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

      {/* SYSTEM SIMPLE HUMANIZED FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            <span>© 2026 KE-AgriLogistics Platform. </span>
            <span className="text-slate-500">Delivering digital post-harvest loss solutions to Kenyan smallholders in Nyandarua, Meru, and Bomet.</span>
          </div>

          <div className="flex gap-4">
            <span className="font-mono text-[10px] text-emerald-400">Node JS Sandbox API: 3000 Ingress</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-[10px]" title="Currently serving GMT-6 timezone index">UTC Tick: 2026-05-21 06:15:23</span>
          </div>
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

