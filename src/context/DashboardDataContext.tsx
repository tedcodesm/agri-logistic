import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
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
} from "../types";
import {
  SEED_FARMERS,
  SEED_BUYERS,
  SEED_DRIVERS,
  SEED_VEHICLES,
  SEED_WAREHOUSES,
  SEED_LISTINGS,
  SEED_ORDERS,
} from "../data";
import { authFetch } from "../lib/authFetch";

const EMAIL_ENTITY_MAP: Record<string, { farmerId?: string; buyerId?: string; driverId?: string }> = {
  "farmer@agrilogistics.ke": { farmerId: "F-103" },
  "buyer@agrilogistics.ke": { buyerId: "B-201" },
  "driver@agrilogistics.ke": { driverId: "D-301" },
};

interface DashboardDataContextValue {
  farmers: Farmer[];
  buyers: Buyer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  warehouses: Warehouse[];
  listings: ProduceListing[];
  orders: Order[];
  activeTrips: DeliveryTrip[];
  currentFarmerId: string;
  currentBuyerId: string;
  currentDriverId: string;
  currentFarmer: Farmer;
  currentBuyer: Buyer;
  currentDriver: Driver;
  myListings: ProduceListing[];
  myOrdersAsFarmer: Order[];
  myOrdersAsBuyer: Order[];
  myTrips: DeliveryTrip[];
  addListing: (listing: ProduceListing) => void;
  syncListings: (local: ProduceListing[]) => void;
  placeOrder: (order: Order) => void;
  addTrip: (trip: DeliveryTrip) => void;
  updateTripIndex: (tripId: string, idx: number, fuel: number) => void;
  completeTrip: (tripId: string, proof: string) => void;
  adjustClimate: (warehouseId: string, tempDelta: number, humDelta: number) => void;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

function mergeListings(primary: ProduceListing[], secondary: ProduceListing[]) {
  const seen = new Set(primary.map((item) => item.id));
  const merged = [...primary];
  for (const item of secondary) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return merged;
}

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const email = user?.email?.toLowerCase() ?? "";
  const mapped = EMAIL_ENTITY_MAP[email] ?? {};

  const [farmers] = useState<Farmer[]>(SEED_FARMERS);
  const [buyers] = useState<Buyer[]>(SEED_BUYERS);
  const [drivers] = useState<Driver[]>(SEED_DRIVERS);
  const [vehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [listings, setListings] = useState<ProduceListing[]>(SEED_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [activeTrips, setActiveTrips] = useState<DeliveryTrip[]>([]);
  const localListingsKey = React.useMemo(
    () => `agri:listings:${email || "anonymous"}`,
    [email]
  );

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(localListingsKey);
      if (!raw) return;
      const localListings = JSON.parse(raw) as ProduceListing[];
      if (Array.isArray(localListings) && localListings.length > 0) {
        setListings((prev) => mergeListings(prev, localListings));
      }
    } catch {
      // Ignore local cache parse/storage failures
    }
  }, [localListingsKey]);

  React.useEffect(() => {
    authFetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.products)) {
          setListings((prev) => mergeListings(d.products as ProduceListing[], prev));
        }
      })
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    authFetch("/api/orders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.orders)) setOrders(d.orders as Order[]);
      })
      .catch(() => undefined);
  }, []);

  const currentFarmerId = mapped.farmerId ?? farmers[0].id;
  const currentBuyerId = mapped.buyerId ?? buyers[0].id;
  const currentDriverId = mapped.driverId ?? drivers[0].id;

  const currentFarmer = farmers.find((f) => f.id === currentFarmerId) ?? farmers[0];
  const currentBuyer = buyers.find((b) => b.id === currentBuyerId) ?? buyers[0];
  const currentDriver = drivers.find((d) => d.id === currentDriverId) ?? drivers[0];

  const myListings = useMemo(() => {
    const ownedByCurrentFarmer = listings.filter((l) => l.farmerId === currentFarmerId);
    if (ownedByCurrentFarmer.length > 0) return ownedByCurrentFarmer;

    // Some older/demo records can carry a different farmerId mapping.
    // Fallback to showing all listings for farmer accounts so previously listed
    // products are still visible in "My Produce" instead of appearing empty.
    if (user?.role === "farmer") return listings;

    return ownedByCurrentFarmer;
  }, [listings, currentFarmerId, user?.role]);

  React.useEffect(() => {
    if (user?.role !== "farmer") return;
    try {
      localStorage.setItem(localListingsKey, JSON.stringify(myListings));
    } catch {
      // Ignore local cache write failures
    }
  }, [user?.role, localListingsKey, myListings]);

  const myOrdersAsBuyer = useMemo(
    () => orders.filter((o) => o.buyerId === currentBuyerId),
    [orders, currentBuyerId]
  );

  const myOrdersAsFarmer = useMemo(() => {
    const myListingIds = new Set(myListings.map((l) => l.id));
    return orders.filter((o) => o.listingIds.some((id) => myListingIds.has(id)));
  }, [orders, myListings]);

  const myTrips = useMemo(
    () => activeTrips.filter((t) => t.driverId === currentDriverId),
    [activeTrips, currentDriverId]
  );

  const addListing = useCallback((listing: ProduceListing) => {
    setListings((prev) => [listing, ...prev]);
    authFetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listing),
    }).catch(() => undefined);
  }, []);

  const syncListings = useCallback((local: ProduceListing[]) => {
    const synced = local.map((item) => ({ ...item, syncStatus: "SYNCED" as const }));
    setListings((prev) => [...synced, ...prev]);
  }, []);

  const placeOrder = useCallback(
    (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      setListings((prev) =>
        prev
          .map((item) => {
            if (newOrder.listingIds.includes(item.id)) {
              return { ...item, quantityKg: Math.max(0, item.quantityKg - newOrder.totalQuantityKg) };
            }
            return item;
          })
          .filter((item) => item.quantityKg > 0)
      );
      const targetBuyer = buyers.find((b) => b.id === newOrder.buyerId);
      if (targetBuyer) {
        fetch("/api/africastalking/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: targetBuyer.phoneNumber.replace(/\s+/g, ""),
            message: `AgriLink: Order #${newOrder.id} confirmed (${newOrder.totalQuantityKg}Kg). Escrow active.`,
          }),
        }).catch(() => undefined);
      }

      authFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      }).catch(() => undefined);
    },
    [buyers]
  );

  const addTrip = useCallback((newTrip: DeliveryTrip) => {
    setActiveTrips((prev) => [newTrip, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (o.id === newTrip.orderId ? { ...o, status: CargoStatus.AGGREGATED } : o))
    );
  }, []);

  const updateTripIndex = useCallback((tripId: string, idx: number, fuelConsumed: number) => {
    setActiveTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const waypoints = t.waypoints.map((w, wIdx) =>
          idx >= (wIdx + 1) * 5 ? { ...w, completed: true } : w
        );
        return { ...t, currentLocationIndex: idx, fuelConsumedLiters: fuelConsumed, waypoints };
      })
    );
  }, []);

  const completeTrip = useCallback(
    (tripId: string, proofCode: string) => {
      const targetTrip = activeTrips.find((t) => t.id === tripId);
      if (!targetTrip) return;
      setActiveTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status: "COMPLETED", deliveryProofCode: proofCode } : t))
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === targetTrip.orderId ? { ...o, status: CargoStatus.DELIVERED } : o))
      );
      const associatedOrder = orders.find((o) => o.id === targetTrip.orderId);
      if (associatedOrder) {
        setWarehouses((prev) =>
          prev.map((w) => {
            if (w.id === "W-501") {
              return {
                ...w,
                currentOccupancyKg: Math.min(
                  w.totalCapacityKg,
                  w.currentOccupancyKg + associatedOrder.totalQuantityKg
                ),
                gradeDistribution: {
                  ...w.gradeDistribution,
                  [ProduceGrade.GRADE_A]:
                    w.gradeDistribution[ProduceGrade.GRADE_A] + associatedOrder.totalQuantityKg,
                },
              };
            }
            return w;
          })
        );
      }
    },
    [activeTrips, orders]
  );

  const adjustClimate = useCallback((warehouseId: string, tempDelta: number, humDelta: number) => {
    setWarehouses((prev) =>
      prev.map((w) => {
        if (w.id !== warehouseId) return w;
        return {
          ...w,
          temperatureCelsius: Math.max(1, w.temperatureCelsius + tempDelta),
          humidityPct: Math.max(5, Math.min(99, w.humidityPct + humDelta)),
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      farmers,
      buyers,
      drivers,
      vehicles,
      warehouses,
      listings,
      orders,
      activeTrips,
      currentFarmerId,
      currentBuyerId,
      currentDriverId,
      currentFarmer,
      currentBuyer,
      currentDriver,
      myListings,
      myOrdersAsFarmer,
      myOrdersAsBuyer,
      myTrips,
      addListing,
      syncListings,
      placeOrder,
      addTrip,
      updateTripIndex,
      completeTrip,
      adjustClimate,
    }),
    [
      farmers,
      buyers,
      drivers,
      vehicles,
      warehouses,
      listings,
      orders,
      activeTrips,
      currentFarmerId,
      currentBuyerId,
      currentDriverId,
      currentFarmer,
      currentBuyer,
      currentDriver,
      myListings,
      myOrdersAsFarmer,
      myOrdersAsBuyer,
      myTrips,
      addListing,
      syncListings,
      placeOrder,
      addTrip,
      updateTripIndex,
      completeTrip,
      adjustClimate,
    ]
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}
