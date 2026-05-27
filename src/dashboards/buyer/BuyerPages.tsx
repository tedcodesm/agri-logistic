import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ShoppingBag, Truck, Shield, Users, Star, Filter } from "lucide-react";
import { useDashboardData } from "../../context/DashboardDataContext";
import { useAuth } from "../../context/AuthContext";
import { StatCard, PageHeader, DashboardCard, ActivityFeed, StatusChip, ChartContainer } from "../../components/dashboard/ui";
import IntegratedGoogleMap from "../../components/IntegratedGoogleMap";
import BuyersPanel from "../../components/BuyersPanel";
import { CargoStatus, PaymentStatus } from "../../types";

const PRICE_CHANGES = [
  { day: "Mon", maize: 40, beans: 92 },
  { day: "Tue", maize: 41, beans: 94 },
  { day: "Wed", maize: 39, beans: 90 },
  { day: "Thu", maize: 42, beans: 95 },
  { day: "Fri", maize: 43, beans: 96 },
];

export function BuyerOverview() {
  const { myOrdersAsBuyer, activeTrips, currentBuyer } = useDashboardData();
  const pendingEscrow = myOrdersAsBuyer.filter((o) => o.paymentStatus !== PaymentStatus.COMPLETED).length;

  return (
    <div>
      <PageHeader
        title="Buyer dashboard"
        description={`${currentBuyer.companyName} — discover produce and track supply chain operations.`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={myOrdersAsBuyer.length} icon={ShoppingBag} accent="blue" />
        <StatCard label="Active Shipments" value={activeTrips.length || 2} icon={Truck} accent="cyan" />
        <StatCard label="Pending Escrow" value={pendingEscrow} icon={Shield} accent="amber" />
        <StatCard label="Supplier Score" value="4.8/5" icon={Users} trend="Reliability 96%" accent="emerald" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardCard title="Live truck tracking">
          <IntegratedGoogleMap
            center={{ lat: -1.1, lng: 36.75 }}
            zoom={9}
            markers={[
              { id: "t1", lat: -0.95, lng: 36.72, title: "KCD-401", role: "TRUCK", description: "ETA 2h 10m" },
              { id: "b", lat: currentBuyer.location.latitude, lng: currentBuyer.location.longitude, title: "Your hub", role: "BUYER" },
            ]}
            height="220px"
          />
        </DashboardCard>
        <DashboardCard title="Market price changes">
          <ChartContainer>
            <LineChart data={PRICE_CHANGES}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="maize" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="beans" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </DashboardCard>
        <DashboardCard title="Recent purchases">
          <ActivityFeed
            items={myOrdersAsBuyer.slice(0, 4).map((o, i) => ({
              id: o.id,
              title: `Order #${o.id} — ${o.totalQuantityKg}kg`,
              time: o.createdAt?.slice(0, 10) || "Recent",
              type: i === 0 ? "success" : "info",
            }))}
          />
        </DashboardCard>
        <DashboardCard title="Top suppliers">
          <ul className="space-y-3 text-sm">
            {["Grace Wanjiku · Nyandarua", "Mary Atieno · Meru", "Josphat Kiprono · Uasin Gishu"].map((s) => (
              <li key={s} className="flex justify-between items-center py-2 border-b border-slate-100">
                <span>{s}</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}

export function BuyerMarketplace() {
  const { buyers, listings, orders, currentBuyerId, placeOrder } = useDashboardData();
  const [county, setCounty] = useState("all");
  const [crop, setCrop] = useState("all");

  const filtered = listings.filter((l) => {
    if (crop !== "all" && !l.cropName.toLowerCase().includes(crop.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Marketplace" description="Browse verified produce with quality and moisture data." />
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-200">
        <Filter className="w-4 h-4 text-slate-400 mt-2" />
        <select className="text-sm border rounded-lg px-3 py-2" value={county} onChange={(e) => setCounty(e.target.value)}>
          <option value="all">All counties</option>
          <option value="nyandarua">Nyandarua</option>
          <option value="meru">Meru</option>
        </select>
        <select className="text-sm border rounded-lg px-3 py-2" value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option value="all">All crops</option>
          <option value="potato">Potatoes</option>
          <option value="maize">Maize</option>
        </select>
      </div>
      <BuyersPanel
        buyers={buyers}
        listings={filtered}
        orders={orders}
        onPlaceOrder={placeOrder}
        embedded
        initialBuyerId={currentBuyerId}
      />
    </div>
  );
}

export function BuyerOrders() {
  const { myOrdersAsBuyer } = useDashboardData();
  return (
    <div>
      <PageHeader title="Orders" description="Active orders, delivery timelines, and history." />
      <div className="space-y-4">
        {myOrdersAsBuyer.map((o) => (
          <div key={o.id}>
          <DashboardCard>
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold">#{o.id}</h3>
                <p className="text-sm text-slate-500">{o.totalQuantityKg} kg · {o.deliveryAddress}</p>
              </div>
              <StatusChip status={o.status === CargoStatus.DELIVERED ? "delivered" : "transit"} />
            </div>
            <div className="mt-4 flex gap-2 text-[10px] flex-wrap">
              {["Ordered", "Escrow", "Warehouse", "In transit", "Delivered"].map((s, i) => (
                <span key={s} className={`px-2 py-1 rounded-full ${i < 3 ? "bg-blue-100 text-blue-800" : "bg-slate-100"}`}>{s}</span>
              ))}
            </div>
            <button type="button" className="mt-4 text-sm font-bold text-agri-emerald">Reorder</button>
          </DashboardCard>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuyerLogistics() {
  const { activeTrips, orders } = useDashboardData();
  return (
    <div>
      <PageHeader title="Logistics tracking" description="Real-time GPS, telemetry, and shipment timelines." />
      <DashboardCard title="Live map" className="mb-6">
        <IntegratedGoogleMap
          center={{ lat: -1.05, lng: 36.78 }}
          zoom={9}
          markers={[
            { id: "w", lat: -0.64, lng: 36.61, title: "Nyandarua warehouse", role: "WAREHOUSE" },
            { id: "t", lat: -1.0, lng: 36.7, title: "Active truck", role: "TRUCK" },
            { id: "b", lat: -1.29, lng: 36.82, title: "Nairobi delivery", role: "BUYER" },
          ]}
          height="320px"
        />
      </DashboardCard>
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="ETA" value="2h 14m" icon={Truck} accent="cyan" />
        <StatCard label="Cargo temp" value="4.2°C" icon={Truck} accent="emerald" />
        <StatCard label="Checkpoints" value="3/5" icon={Truck} accent="blue" />
      </div>
    </div>
  );
}

export function BuyerPayments() {
  return (
    <div>
      <PageHeader title="Escrow & payments" description="M-PESA STK, PesaPal, and secure fund release." />
      <DashboardCard title="Payment flow" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {["Buyer funds escrow", "Delivery tracked", "Quality verified", "Funds released"].map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-sm">
              <span className="w-8 h-8 rounded-full bg-agri-emerald text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {s}
              {i < 3 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
      </DashboardCard>
      <DashboardCard title="Recent transactions">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span>M-PESA STK · ORD-1001</span><StatusChip status="escrow" /></div>
          <div className="flex justify-between py-2 border-b"><span>PesaPal · ORD-998</span><StatusChip status="released" /></div>
        </div>
      </DashboardCard>
    </div>
  );
}

export function BuyerSuppliers() {
  const { farmers } = useDashboardData();
  return (
    <div>
      <PageHeader title="Suppliers" description="Ratings, reliability, and preferred partners." />
      <div className="grid md:grid-cols-2 gap-4">
        {farmers.map((f) => (
          <div key={f.id}>
          <DashboardCard>
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{f.name}</h3>
                <p className="text-sm text-slate-500">{f.location.county} · {f.primaryCrop}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-600 flex items-center gap-1 justify-end">
                  <Star className="w-4 h-4 fill-current" /> 4.{8 + (f.id.charCodeAt(2) % 2)}
                </p>
                <p className="text-xs text-slate-500">96% on-time</p>
              </div>
            </div>
            <button type="button" className="mt-4 text-sm font-bold text-agri-emerald">Add to preferred</button>
          </DashboardCard>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuyerNotifications() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <DashboardCard>
        <ActivityFeed
          items={[
            { id: "1", title: "Shipment KCD-401 approaching Nairobi", time: "15m ago", type: "info" },
            { id: "2", title: "Escrow funded for order #8821", time: "2h ago", type: "success" },
            { id: "3", title: "Maize prices down 3% in Eldoret", time: "4h ago", type: "warning" },
          ]}
        />
      </DashboardCard>
    </div>
  );
}

export function BuyerProfile() {
  const { user } = useAuth();
  const { currentBuyer } = useDashboardData();
  return (
    <div>
      <PageHeader title="Profile" />
      <DashboardCard>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Company</dt><dd className="font-semibold">{currentBuyer.companyName}</dd></div>
          <div><dt className="text-slate-500">Contact</dt><dd className="font-semibold">{currentBuyer.name}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user?.email}</dd></div>
          <div><dt className="text-slate-500">City</dt><dd className="font-semibold">{currentBuyer.location.city}</dd></div>
        </dl>
      </DashboardCard>
    </div>
  );
}
