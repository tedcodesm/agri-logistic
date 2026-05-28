import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { AnimatePresence, motion } from "motion/react";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  MapPin,
  Shield,
  Truck,
  Warehouse,
} from "lucide-react";

type ShipmentState =
  | "Order Created"
  | "Escrow Funded"
  | "Driver Assigned"
  | "Dispatched"
  | "En Route"
  | "At Warehouse"
  | "Quality Verification"
  | "Delivery Completed"
  | "Escrow Released";

type RouteNodeRole = "FARM" | "WAREHOUSE" | "BUYER" | "WAYPOINT";

interface RouteNode {
  id: string;
  label: string;
  county: string;
  role: RouteNodeRole;
  lat: number;
  lng: number;
}

interface RouteDefinition {
  id: string;
  code: string;
  cargoType: string;
  farmer: string;
  buyer: string;
  driver: string;
  escrowAmountKes: number;
  nodes: RouteNode[];
}

interface LiveLogisticsSimulationProps {
  compact?: boolean;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

const SHIPMENT_STATES: ShipmentState[] = [
  "Order Created",
  "Escrow Funded",
  "Driver Assigned",
  "Dispatched",
  "En Route",
  "At Warehouse",
  "Quality Verification",
  "Delivery Completed",
  "Escrow Released",
];

const ROUTES: RouteDefinition[] = [
  {
    id: "rt-eldoret-nairobi",
    code: "KCD-401",
    cargoType: "Irish Potatoes · 2.4T",
    farmer: "Josphat Kiprono",
    buyer: "Nairobi Fresh Wholesalers",
    driver: "Samson Kiprop",
    escrowAmountKes: 124000,
    nodes: [
      { id: "f1", label: "Farm Pickup", county: "Eldoret", role: "FARM", lat: 0.5143, lng: 35.2698 },
      { id: "w1", label: "Cold Warehouse", county: "Nakuru", role: "WAREHOUSE", lat: -0.3031, lng: 36.08 },
      { id: "b1", label: "Buyer Depot", county: "Nairobi", role: "BUYER", lat: -1.2921, lng: 36.8219 },
    ],
  },
  {
    id: "rt-machakos-mombasa",
    code: "KCD-517",
    cargoType: "French Beans · 1.1T",
    farmer: "Mary Atieno",
    buyer: "Coast Agro Terminal",
    driver: "Paul Nzioka",
    escrowAmountKes: 89000,
    nodes: [
      { id: "f2", label: "Farm Pickup", county: "Machakos", role: "FARM", lat: -1.5177, lng: 37.2634 },
      { id: "w2", label: "Quality Hub", county: "Makueni", role: "WAREHOUSE", lat: -1.8035, lng: 37.6191 },
      { id: "b2", label: "Buyer Terminal", county: "Mombasa", role: "BUYER", lat: -4.0435, lng: 39.6682 },
    ],
  },
];

function buildInterpolatedPath(nodes: RouteNode[], pointsPerLeg = 36) {
  const path: { lat: number; lng: number }[] = [];
  const checkpoints: number[] = [0];

  for (let leg = 0; leg < nodes.length - 1; leg += 1) {
    const from = nodes[leg];
    const to = nodes[leg + 1];
    for (let i = 0; i < pointsPerLeg; i += 1) {
      const t = i / pointsPerLeg;
      path.push({
        lat: from.lat + (to.lat - from.lat) * t,
        lng: from.lng + (to.lng - from.lng) * t,
      });
    }
    checkpoints.push(path.length - 1);
  }
  path.push({ lat: nodes[nodes.length - 1].lat, lng: nodes[nodes.length - 1].lng });
  checkpoints[checkpoints.length - 1] = path.length - 1;

  return { path, checkpoints };
}

function ShipmentTimeline({
  activeStep,
  compact,
}: {
  activeStep: number;
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
      <div className="space-y-3">
        {SHIPMENT_STATES.map((step, idx) => {
          const state = idx < activeStep ? "completed" : idx === activeStep ? "active" : "pending";
          return (
            <motion.div
              key={step}
              layout
              className={`relative pl-8 py-1 ${idx < SHIPMENT_STATES.length - 1 ? "pb-4" : ""}`}
            >
              {idx < SHIPMENT_STATES.length - 1 && (
                <span
                  className={`absolute left-[9px] top-6 w-[2px] h-[calc(100%-8px)] ${
                    idx < activeStep ? "bg-emerald-400/80" : "bg-slate-700"
                  }`}
                />
              )}
              <span
                className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                  state === "completed"
                    ? "bg-emerald-500 border-emerald-400"
                    : state === "active"
                      ? "bg-emerald-500/20 border-emerald-400"
                      : "bg-slate-800 border-slate-600"
                }`}
              >
                {state === "completed" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${state === "active" ? "bg-emerald-400" : "bg-slate-500"}`} />
                )}
              </span>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-semibold ${
                    state === "completed"
                      ? "text-emerald-300"
                      : state === "active"
                        ? "text-white"
                        : "text-slate-500"
                  }`}
                >
                  {step}
                </p>
                {state === "active" && (
                  <motion.span
                    initial={{ opacity: 0.6, scale: 0.9 }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.05, 0.9] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  >
                    Active
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MapMarkers({
  route,
  truckPos,
  selectedTruck,
  onSelectTruck,
}: {
  route: RouteDefinition;
  truckPos: { lat: number; lng: number };
  selectedTruck: string | null;
  onSelectTruck: (id: string) => void;
}) {
  const [truckRef, truckInstance] = useAdvancedMarkerRef();
  const markerColor: Record<RouteNodeRole, string> = {
    FARM: "#22c55e",
    WAREHOUSE: "#6366f1",
    BUYER: "#f59e0b",
    WAYPOINT: "#64748b",
  };

  return (
    <>
      {route.nodes.map((node) => (
        <AdvancedMarker key={node.id} position={{ lat: node.lat, lng: node.lng }} title={`${node.label} · ${node.county}`}>
          <Pin background={markerColor[node.role]} borderColor="#ffffff" glyphColor="#ffffff" scale={1.05} />
        </AdvancedMarker>
      ))}
      <AdvancedMarker
        ref={truckRef}
        position={truckPos}
        title={`Truck ${route.code}`}
        onClick={() => onSelectTruck(route.id)}
      >
        <motion.div
          animate={{
            scale: selectedTruck === route.id ? [1, 1.18, 1] : [1, 1.08, 1],
            boxShadow:
              selectedTruck === route.id
                ? [
                    "0 0 0px rgba(16,185,129,0.2)",
                    "0 0 24px rgba(16,185,129,0.9)",
                    "0 0 0px rgba(16,185,129,0.2)",
                  ]
                : [
                    "0 0 0px rgba(59,130,246,0.1)",
                    "0 0 14px rgba(59,130,246,0.45)",
                    "0 0 0px rgba(59,130,246,0.1)",
                  ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className={`w-9 h-9 rounded-full border-2 ${
            selectedTruck === route.id
              ? "bg-emerald-500 border-emerald-200"
              : "bg-cyan-500 border-cyan-200"
          } text-white flex items-center justify-center`}
        >
          <Truck className="w-4 h-4" />
        </motion.div>
      </AdvancedMarker>
      {selectedTruck === route.id && (
        <InfoWindow anchor={truckInstance}>
          <div className="text-xs min-w-[140px]">
            <p className="font-bold text-slate-900">Truck {route.code}</p>
            <p className="text-slate-600">{route.cargoType}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function LiveLogisticsSimulation({ compact = false }: LiveLogisticsSimulationProps) {
  const [selectedRouteId, setSelectedRouteId] = useState(ROUTES[0].id);
  const [routeProgress, setRouteProgress] = useState<Record<string, number>>({
    [ROUTES[0].id]: 0,
    [ROUTES[1].id]: 0,
  });
  const [alerts, setAlerts] = useState<{ id: string; text: string; level: "warning" | "success" }[]>([]);
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState(false);
  const lastAlertRef = useRef<Record<string, number>>({});

  const routeComputed = useMemo(
    () =>
      Object.fromEntries(
        ROUTES.map((r) => [r.id, buildInterpolatedPath(r.nodes)])
      ) as Record<string, { path: { lat: number; lng: number }[]; checkpoints: number[] }>,
    []
  );

  const selectedRoute = ROUTES.find((r) => r.id === selectedRouteId) ?? ROUTES[0];
  const selectedPath = routeComputed[selectedRoute.id].path;
  const selectedProgress = routeProgress[selectedRoute.id] ?? 0;
  const selectedTruckPos = selectedPath[Math.min(selectedProgress, selectedPath.length - 1)];

  useEffect(() => {
    const timer = setInterval(() => {
      setRouteProgress((prev) => {
        const next = { ...prev };
        ROUTES.forEach((route) => {
          const max = routeComputed[route.id].path.length - 1;
          next[route.id] = (next[route.id] ?? 0) >= max ? 0 : (next[route.id] ?? 0) + 1;
        });
        return next;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [routeComputed]);

  useEffect(() => {
    const pct = selectedProgress / (selectedPath.length - 1);
    const currentAlertStage = Math.floor(pct * 10);
    if (lastAlertRef.current[selectedRoute.id] === currentAlertStage) return;

    if (currentAlertStage === 3) {
      setAlerts((prev) => [
        ...prev,
        { id: `${Date.now()}-delay`, text: "Delay detected near Machakos corridor", level: "warning" },
      ]);
      lastAlertRef.current[selectedRoute.id] = currentAlertStage;
    } else if (currentAlertStage === 5) {
      setAlerts((prev) => [
        ...prev,
        { id: `${Date.now()}-warehouse`, text: "Cargo arrived at warehouse checkpoint", level: "success" },
      ]);
      lastAlertRef.current[selectedRoute.id] = currentAlertStage;
    } else if (currentAlertStage === 7) {
      setAlerts((prev) => [
        ...prev,
        { id: `${Date.now()}-moisture`, text: "Moisture level exceeds threshold (14.1%)", level: "warning" },
      ]);
      lastAlertRef.current[selectedRoute.id] = currentAlertStage;
    } else if (currentAlertStage >= 9) {
      setAlerts((prev) => [
        ...prev,
        { id: `${Date.now()}-escrow`, text: "Escrow ready for release", level: "success" },
      ]);
      lastAlertRef.current[selectedRoute.id] = currentAlertStage;
    }
  }, [selectedProgress, selectedPath.length, selectedRoute.id]);

  useEffect(() => {
    if (!alerts.length) return;
    const timeout = setTimeout(() => {
      setAlerts((prev) => prev.slice(1));
    }, 3800);
    return () => clearTimeout(timeout);
  }, [alerts]);

  const stateIndex = Math.min(
    SHIPMENT_STATES.length - 1,
    Math.floor((selectedProgress / (selectedPath.length - 1)) * SHIPMENT_STATES.length)
  );
  const currentState = SHIPMENT_STATES[stateIndex];
  const etaMinutes = Math.max(4, Math.round(((selectedPath.length - 1 - selectedProgress) / 2.5)));

  return (
    <div className={`${compact ? "" : "mt-8"}`}>
      <div className={`grid ${compact ? "xl:grid-cols-10" : "xl:grid-cols-12"} gap-4`}>
        <motion.div
          layout
          className={`${compact ? "xl:col-span-3" : "xl:col-span-3"} rounded-2xl bg-slate-900/95 border border-slate-800 p-4 text-slate-200 shadow-xl`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shipment Intelligence</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              Live simulation
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {ROUTES.map((route) => {
              const active = route.id === selectedRouteId;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2 transition-all ${
                    active
                      ? "border-emerald-400/50 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70"
                  }`}
                >
                  <p className="text-xs font-semibold text-white">{route.code}</p>
                  <p className="text-[11px] text-slate-400">{route.nodes[0].county} → {route.nodes[2].county}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-700 bg-slate-800/40 space-y-2 text-xs">
            <p className="flex justify-between"><span className="text-slate-400">Farmer</span><strong>{selectedRoute.farmer}</strong></p>
            <p className="flex justify-between"><span className="text-slate-400">Cargo</span><strong>{selectedRoute.cargoType}</strong></p>
            <p className="flex justify-between"><span className="text-slate-400">Driver</span><strong>{selectedRoute.driver}</strong></p>
            <p className="flex justify-between"><span className="text-slate-400">ETA</span><strong>{etaMinutes} min</strong></p>
            <p className="flex justify-between"><span className="text-slate-400">Escrow</span><strong>KES {selectedRoute.escrowAmountKes.toLocaleString()}</strong></p>
            <p className="pt-1 border-t border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Status</span>
              <span className="text-emerald-300 font-semibold">{currentState}</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          layout
          className={`${compact ? "xl:col-span-4" : "xl:col-span-6"} rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl`}
        >
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Live Route Visibility
            </p>
            <p className="text-[11px] text-slate-400">Telemetry ping every 1.8s</p>
          </div>
          <div className={`${compact ? "h-[360px]" : "h-[460px]"} relative`}>
            {hasValidKey ? (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={{ lat: -1.2921, lng: 36.8219 }}
                  defaultZoom={6}
                  mapId="DEMO_MAP_ID"
                  style={{ width: "100%", height: "100%" }}
                >
                  {ROUTES.map((route) => {
                    const path = routeComputed[route.id].path;
                    const progress = routeProgress[route.id] ?? 0;
                    const truckPos = path[Math.min(progress, path.length - 1)];
                    return (
                      <React.Fragment key={route.id}>
                        <MapMarkers
                          route={route}
                          truckPos={truckPos}
                          selectedTruck={selectedRouteId}
                          onSelectTruck={(id) => setSelectedRouteId(id)}
                        />
                      </React.Fragment>
                    );
                  })}
                </Map>
              </APIProvider>
            ) : (
              <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <div className="relative h-56 rounded-2xl border border-slate-700 bg-slate-800/40 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="none">
                      <path d="M 20 140 Q 100 40 170 100 T 300 36" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 6" />
                    </svg>
                    <motion.div
                      className="absolute w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.85)]"
                      animate={{
                        left: ["6%", "31%", "58%", "82%", "6%"],
                        top: ["74%", "51%", "57%", "21%", "74%"],
                      }}
                      transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                    />
                    <p className="absolute bottom-2 left-2 text-[11px] text-slate-300">
                      Simulated logistics route preview
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          layout
          className={`${compact ? "xl:col-span-3" : "xl:col-span-3"} rounded-2xl bg-slate-900/95 border border-slate-800 p-4 text-slate-200 shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shipment Timeline</h3>
            <button
              type="button"
              onClick={() => setMobileTimelineOpen((v) => !v)}
              className="xl:hidden text-[11px] px-2 py-1 rounded-lg border border-slate-700"
            >
              {mobileTimelineOpen ? "Hide" : "Show"}
            </button>
          </div>
          <div className="hidden xl:block mt-4">
            <ShipmentTimeline activeStep={stateIndex} compact={compact} />
          </div>
          <AnimatePresence>
            {mobileTimelineOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="xl:hidden mt-4 overflow-hidden"
              >
                <ShipmentTimeline activeStep={stateIndex} compact />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Warehouse Verification
            </h4>
            <p className="text-xs p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
              Temperature: <strong className="text-emerald-300">4.2°C</strong> · Moisture:{" "}
              <strong className="text-emerald-300">13.4%</strong>
            </p>
            <p className="text-xs p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
              Quality officer signed digital receipt at Nakuru hub.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="fixed right-4 bottom-4 z-50 w-[min(92vw,340px)] space-y-2 pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl border px-3 py-2.5 shadow-xl backdrop-blur pointer-events-auto ${
                alert.level === "warning"
                  ? "bg-amber-500/15 border-amber-400/40 text-amber-100"
                  : "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
              }`}
            >
              <p className="text-xs font-semibold flex items-center gap-2">
                {alert.level === "warning" ? (
                  <BellRing className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {alert.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!compact && (
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">ETA countdown</p>
            <p className="font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-emerald-600" /> {etaMinutes} minutes to next checkpoint
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Geo-fence</p>
            <p className="font-bold text-slate-900 mt-1">
              {stateIndex >= 5 ? "Inside warehouse perimeter" : "Approaching controlled zone"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Replay</p>
            <p className="font-bold text-slate-900 mt-1">Route auto-replays after escrow release</p>
          </div>
        </div>
      )}
    </div>
  );
}
