import React, { useState, useEffect, useRef } from "react";
import { 
  Truck, 
  Map, 
  Navigation, 
  TrendingUp, 
  CheckSquare, 
  CheckCircle, 
  Clock, 
  Activity, 
  BatteryCharging, 
  Fuel, 
  Signature, 
  Play, 
  Award, 
  Maximize2 
} from "lucide-react";
import { Driver, Vehicle, Order, DeliveryTrip, CargoStatus } from "../types";
import { calculateOptimalLoad, constructDeliveryTrip } from "../data";
import IntegratedGoogleMap from "./IntegratedGoogleMap";

interface DriversPanelProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  orders: Order[];
  activeTrips: DeliveryTrip[];
  onAddTrip: (trip: DeliveryTrip) => void;
  onUpdateTripIndex: (tripId: string, idx: number, fuelConsumed: number) => void;
  onCompleteTrip: (tripId: string, proofCode: string) => void;
}

export default function DriversPanel({
  drivers,
  vehicles,
  orders,
  activeTrips,
  onAddTrip,
  onUpdateTripIndex,
  onCompleteTrip
}: DriversPanelProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>("D-301");
  const [assignedOrderId, setAssignedOrderId] = useState<string>("");
  const [signatureName, setSignatureName] = useState<string>("");
  const [signingActive, setSigningActive] = useState<boolean>(false);

  // Timer reference for active GPS interval
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const currentVehicle = vehicles.find(v => v.id === currentDriver.vehicleId) || vehicles[0];

  // Paid orders which need dispatch
  const pendingOrders = orders.filter(o => o.status === CargoStatus.READY_FOR_COLLECTION || o.status === CargoStatus.IN_WAREHOUSE);

  // Filter trips for this driver
  const driverTrips = activeTrips.filter(t => t.driverId === selectedDriverId);
  const activeTrip = driverTrips.find(t => t.status === "TRANSIT" || t.status === "ASSIGNED" || t.status === "LOADING");

  // Convert current active trip coordinates with live marker positioning
  const mapCenter = activeTrip && activeTrip.waypoints && activeTrip.waypoints[0] 
    ? { lat: activeTrip.waypoints[0].lat, lng: activeTrip.waypoints[0].lng }
    : { lat: -0.638, lng: 36.608 }; // Default Kenya agricultural coordinates (Nyandarua core)

  // Waypoints mapped for Advanced Google Pins rendering
  const mapMarkers: any[] = activeTrip 
    ? activeTrip.waypoints.map((w, index) => ({
        id: `wp-${index}-${w.name}`,
        lat: w.lat,
        lng: w.lng,
        title: `${w.name} (${w.role})`,
        role: w.role as any,
        description: `Stop #${index + 1} during logistics transit. Status: ${activeTrip.currentLocationIndex >= (index + 1) * 7 - 3 ? "✓ Completed" : "⏳ Queue"}`
      }))
    : [];

  // If TRUCK is in transit mode, inject the live GPS position as marker
  if (activeTrip && activeTrip.status === "TRANSIT") {
    const currentCoord = activeTrip.routeCoordinates[activeTrip.currentLocationIndex % activeTrip.routeCoordinates.length];
    if (currentCoord) {
      mapMarkers.push({
        id: "live-transit-truck-marker",
        lat: currentCoord[0],
        lng: currentCoord[1],
        title: `Express Truck [${currentVehicle.plateNumber}] - ${currentDriver.name}`,
        role: "TRUCK" as any,
        color: "#ef4444",
        description: `Moving active delivery volume. Fuel efficiency rate is ${currentVehicle.fuelEfficiencyKmpl} Km/L.`
      });
    }
  }

  useEffect(() => {
    // Cleanup GPS timers on unmount
    return () => {
      Object.values(timersRef.current).forEach(clearInterval);
    };
  }, []);

  // Compute smart load optimization for current pending order
  const mockListingsForLoad = [
    { id: "L-X", farmerId: "F-X", cropName: "Potatoes", quantityKg: 1800, pricePerKgKes: 30, harvestDate: "2026-05-19", grade: "B" as any, moistureContentPct: 18, spoilageRiskPct: 8, timestamp: "", description: "High-density Shangi potatoes optimized weight aggregation." },
    { id: "L-Y", farmerId: "F-Y", cropName: "Avocados", quantityKg: 1200, pricePerKgKes: 70, harvestDate: "2026-05-20", grade: "A" as any, moistureContentPct: 70, spoilageRiskPct: 15, timestamp: "", description: "Premium export-grade cold chain verified avocados." },
  ];
  const loadPlan = calculateOptimalLoad(mockListingsForLoad, currentVehicle.payloadCapacityKg, currentVehicle.tempControlled);

  // Fulfill assignment and construct trip route waypoints
  function handleDispatch() {
    if (!assignedOrderId) return;
    
    // Waypoints represent the dynamic supply stops routing
    // Let's create localized waypoint configurations matching Kenya highways
    const targetOrder = orders.find(o => o.id === assignedOrderId);
    const waypoints: any[] = [];

    // Stop 1: Collection at farm gate in Nyandarua/Uasin Gishu
    waypoints.push({ name: "Farms Collection Node", lat: -0.638, lng: 36.608, role: "COLLECTION" });
    // Stop 2: regional collection storage center
    waypoints.push({ name: "Nyandarua Storage Silo", lat: -0.560, lng: 36.425, role: "WAREHOUSE" });
    // Stop 3: Final buyer delivery terminal in metropolitan Nairobi
    waypoints.push({ name: "Nairobi Fresh Distributors Depot", lat: -1.292, lng: 36.821, role: "BUYER" });

    const newTrip = constructDeliveryTrip(assignedOrderId, selectedDriverId, currentVehicle.id, waypoints);
    onAddTrip(newTrip);
    setAssignedOrderId("");
  }

  // Trigger real-time tracking interval simulating live GPS motion
  function startSimulatedRoute(tripId: string) {
    const trip = activeTrips.find(t => t.id === tripId);
    if (!trip) return;

    if (timersRef.current[tripId]) {
      clearInterval(timersRef.current[tripId]);
    }

    // Set trip in transit
    trip.status = "TRANSIT";

    let index = trip.currentLocationIndex;
    const totalSteps = trip.routeCoordinates.length;

    timersRef.current[tripId] = setInterval(() => {
      index += 1;
      
      // Calculate realistic dynamic fuel index (liters consumed) based on load and distance
      const distancePerStepKm = 2.4; // constant approximation
      const estimatedFuelUsedPerKm = 1 / currentVehicle.fuelEfficiencyKmpl;
      const fuelBatch = Number((index * distancePerStepKm * estimatedFuelUsedPerKm).toFixed(2));

      if (index >= totalSteps) {
        clearInterval(timersRef.current[tripId]);
        delete timersRef.current[tripId];
        
        // Mark arriving at buyer terminal
        onUpdateTripIndex(tripId, totalSteps - 1, fuelBatch);
        alert(`🚚 Job Completed! Cargo arrived safely at Buyer Dispatch Gate. Initiating verification proofs.`);
      } else {
        onUpdateTripIndex(tripId, index, fuelBatch);
      }
    }, 1500); // 1.5 seconds per GPS coordinate update
  }

  // Handle proof code signoff
  function handleCompletePayment(tripId: string) {
    if (!signatureName.trim()) {
      alert("Please sign using receiver initials");
      return;
    }
    const receiptCode = "POD-SIG-" + Math.round(Math.random() * 80000 + 10000);
    onCompleteTrip(tripId, receiptCode);
    setSignatureName("");
    setSigningActive(false);
  }

  return (
    <div id="drivers-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Driver Workspace Profile Panel */}
      <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Transporter Dispatch Bay
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
            {currentDriver.name}
            <span className="text-xs font-normal text-slate-400">({currentDriver.id})</span>
          </h3>
          <p className="text-xs text-slate-500">
            🚚 Registered Vehicle: <strong className="text-slate-700">{currentVehicle.plateNumber}</strong> ({currentVehicle.type}) | Stagger Capacity: <strong>{currentVehicle.payloadCapacityKg} Kg</strong>
          </p>
        </div>

        {/* Driver Account Selection */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Log In Driver ID:</span>
          {drivers.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDriverId(d.id)}
              className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                selectedDriverId === d.id 
                  ? "bg-slate-800 text-white border-slate-800" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {d.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* LEFT COLUMN: Job assign and Load Planner details */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Dynamic Multi-Stop Dispatch Manager */}
        <div id="dispatch-form-card" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
            <Navigation className="w-4 h-4 text-amber-500 animate-pulse" />
            Establish Route Waypoint Dispatch
          </h4>

          {activeTrip ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Active Logistics Job Trip is live on dispatch.
              </p>
              <p className="text-[11px] text-emerald-700">
                Tracking code: <strong>{activeTrip.id}</strong> | Associated Supply: Order {activeTrip.orderId}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                You must simulate current GPS coordinates transit updates in the real-time tracker monitor column to finalize logs and deliveries.
              </p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No agricultural orders awaiting logistics transit at this hour.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase">Select Orders Awaiting Dispatch</label>
                <select
                  id="dispatch-order-select"
                  value={assignedOrderId}
                  onChange={(e) => setAssignedOrderId(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white"
                >
                  <option value="">-- Choose verified active contract invoice --</option>
                  {pendingOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      Order {o.id} ({o.totalQuantityKg} Kg • {o.deliveryAddress.substring(0, 25)}...)
                    </option>
                  ))}
                </select>
              </div>

              {assignedOrderId && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Smart Load Optimization Stacking Matrix</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-slate-600">
                      Volume Utilization: <strong className="text-slate-800">{loadPlan.volumeUtilizationPct}%</strong>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-slate-600">
                      Total Weight: <strong className="text-slate-800">{loadPlan.totalWeightKg} Kg</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-lg text-[11px] leading-relaxed italic text-amber-800 border-l-4 border-amber-500">
                    💡 <strong>Optimum Hold Stacking:</strong> "{loadPlan.optimalStackingInstruction}"
                  </div>
                </div>
              )}

              <button
                id="dispatch-confirm-btn"
                onClick={handleDispatch}
                disabled={!assignedOrderId}
                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 py-3 rounded-xl font-semibold text-white tracking-wide text-xs transition-all select-none cursor-pointer"
              >
                Flesh out routing waypoints & dispatch
              </button>
            </div>
          )}
        </div>

        {/* Load optimization metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Fuel Consumption & Efficiency Matrix
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Consumpt Efficiency</span>
                <strong className="text-slate-800 text-sm">{currentVehicle.fuelEfficiencyKmpl} Km / Liter</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
                <BatteryCharging className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Temp Controller</span>
                <strong className="text-slate-800 text-sm">{currentVehicle.tempControlled ? "REEFER ACTIVE ✓" : "FLATBED PASSIVE"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: GPS Navigation simulator */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* GPS map tracker */}
        <div id="gps-route-tracker-card" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col min-h-[450px]">
          <h4 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
            <Map className="w-4 h-4 text-amber-500" />
            Live GPS Tracking Monitor
          </h4>

          {activeTrip ? (
            <div className="flex-1 flex flex-col gap-5 justify-between">
              
              {/* Waypoint status flags */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Trip Waypoints Sequence</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {activeTrip.waypoints.map((w, index) => {
                    const isCompleted = activeTrip.currentLocationIndex >= (index + 1) * 7 - 3;
                    return (
                      <div 
                        key={index} 
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                          isCompleted 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : activeTrip.status === "TRANSIT" && activeTrip.currentLocationIndex >= index * 5 
                              ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold animate-pulse"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold text-slate-500">{w.role}</span>
                        <span className="font-semibold block truncate max-w-[100px]">{w.name}</span>
                        <span className="text-[9px]">{isCompleted ? "✓ Passed" : "Awaiting"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INTERACTIVE REAL GOOGLE MAP CONTAINER */}
              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                  Interactive GIS Navigation System
                </span>
                <IntegratedGoogleMap 
                  center={mapCenter} 
                  zoom={11} 
                  markers={mapMarkers} 
                  height="180px" 
                />
              </div>

              {/* STYLIZED VECTOR WAYPOINT MAP CANVAS */}
              <div className="relative bg-slate-905 h-36 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">

                <div className="absolute inset-0 bg-slate-50 bg-[radial-gradient(#ddd_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Simulated Road Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <path 
                    d="M 50,70 Q 150,20 250,70 T 450,70" 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="4" 
                    strokeDasharray="6 4"
                  />
                  {/* Highlighted active route line segment */}
                  <path 
                    d="M 50,70 Q 150,20 250,70 T 450,70" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="4" 
                    strokeDasharray="6 4"
                    strokeDashoffset={-activeTrip.currentLocationIndex * 6}
                    className="transition-all"
                  />
                </svg>

                {/* Farmer Point */}
                <div className="absolute left-[30px] top-[60px] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white text-[8px] font-bold text-white shadow">F</span>
                  <span className="text-[8px] text-slate-600 mt-1 font-bold">Moiben Farms</span>
                </div>

                {/* Warehouse Dot Point */}
                <div className="absolute left-[240px] top-[40px] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center border-2 border-white text-[8px] font-bold text-white shadow">W</span>
                  <span className="text-[8px] text-slate-600 mt-1 font-bold">Grain Depot</span>
                </div>

                {/* Buyer Dot Point */}
                <div className="absolute right-[30px] top-[60px] flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white text-[8px] font-bold text-white shadow">B</span>
                  <span className="text-[8px] text-slate-600 mt-1 font-bold">Nairobi</span>
                </div>

                {/* Moving Truck Entity */}
                {activeTrip.status === "TRANSIT" && (
                  <div 
                    className="absolute p-1.5 rounded-full bg-slate-800 text-white shadow-lg border border-white z-10 transition-all duration-300"
                    style={{
                      left: `${50 + (activeTrip.currentLocationIndex / activeTrip.routeCoordinates.length) * 350}px`,
                      top: `${60 - Math.sin((activeTrip.currentLocationIndex / activeTrip.routeCoordinates.length) * Math.PI) * 35}px`
                    }}
                  >
                    <Truck className="w-4 h-4 text-amber-400 animate-bounce" />
                  </div>
                )}
              </div>

              {/* TRIP METRICS SUMMARY PANEL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Fuel Consumed</span>
                    <strong className="text-slate-800 text-sm font-mono">{activeTrip.fuelConsumedLiters || 0} L</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Route Index</span>
                    <strong className="text-slate-800 text-sm font-mono">
                      {activeTrip.currentLocationIndex} / {activeTrip.routeCoordinates.length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Current Status</span>
                    <strong className="text-amber-600 font-bold block bg-amber-50 px-2 py-0.5 rounded text-[11px] uppercase">
                      {activeTrip.status}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Fulfillment ID</span>
                    <strong className="text-slate-800 font-mono text-[10px]">{activeTrip.id}</strong>
                  </div>
                </div>
              </div>

              {/* GPS Actions Triggers */}
              <div className="flex gap-3">
                <button
                  id={`start-route-btn-${activeTrip.id}`}
                  onClick={() => startSimulatedRoute(activeTrip.id)}
                  disabled={activeTrip.status === "TRANSIT" || activeTrip.status === "COMPLETED"}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl text-xs transition-all tracking-wide select-none cursor-pointer"
                >
                  <Play className="w-4.5 h-4.5 text-amber-500" />
                  Initiate GPS Route Simulation (Wote to Nairobi Highway)
                </button>

                {activeTrip.currentLocationIndex >= activeTrip.routeCoordinates.length - 1 && (
                  <button
                    id="trigger-signs-panel"
                    onClick={() => setSigningActive(true)}
                    className="flex items-center gap-1 bg-emerald-500 text-white px-4 py-3 rounded-xl font-semibold text-xs hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Signature className="w-4 h-4" />
                    Sign Proof
                  </button>
                )}
              </div>

              {/* Dynamic Digital Signature proof panel */}
              {signingActive && (
                <div id="drivers-signature-modal" className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-4 border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-805 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Sign Digitally to Confirm Delivery Receipts</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Safaricom STK payment ledger block requires biometric or written validation initials by receiving buyer clerk.
                  </p>

                  <div className="space-y-2 text-xs">
                    <label className="block text-[10px] uppercase text-slate-400">Receiver's Signatory Initials</label>
                    <div className="flex gap-2">
                      <input
                        id="signname-input"
                        type="text"
                        placeholder="e.g. M. Mwita / Twiga Hub"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 p-2 text-xs rounded outline-none focus:border-amber-500"
                      />
                      <button
                        id="submit-pod-sig-btn"
                        onClick={() => handleCompletePayment(activeTrip.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded text-xs font-bold"
                      >
                        Register Proof in Ledger
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-xs py-8">
              No active vehicle runs listed for driver {currentDriver.name}. Use the dispatch portal to trigger route logistics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
