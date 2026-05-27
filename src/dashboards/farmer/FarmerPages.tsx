import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Wallet,
  Leaf,
  Plus,
  Droplets,
  TrendingUp,
} from "lucide-react";
import { useDashboardData } from "../../context/DashboardDataContext";
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  PageHeader,
  DashboardCard,
  ActivityFeed,
  StatusChip,
  CtaButton,
  ChartContainer,
} from "../../components/dashboard/ui";
import MkulimaChat from "../../components/dashboard/MkulimaChat";
import IntegratedGoogleMap from "../../components/IntegratedGoogleMap";
import { CargoStatus, ProduceGrade, ProduceListing } from "../../types";

const PRICE_TREND = [
  { month: "Jan", price: 38 },
  { month: "Feb", price: 40 },
  { month: "Mar", price: 42 },
  { month: "Apr", price: 41 },
  { month: "May", price: 44 },
  { month: "Jun", price: 46 },
];

const DEMAND_FORECAST = [
  { county: "Nairobi", demand: 92 },
  { county: "Mombasa", demand: 78 },
  { county: "Nakuru", demand: 65 },
  { county: "Eldoret", demand: 58 },
];

const ORDER_STEPS = [
  "Buyer placed order",
  "Escrow funded",
  "Driver assigned",
  "In transit",
  "Delivered",
  "Payment released",
];

export function FarmerOverview() {
  const navigate = useNavigate();
  const { myListings, myOrdersAsFarmer, currentFarmer } = useDashboardData();
  const revenue = myOrdersAsFarmer.reduce((s, o) => s + o.totalCostKes, 0);
  const escrowPending = myOrdersAsFarmer.filter((o) => o.status !== "DELIVERED").length * 45000;

  return (
    <div>
      <PageHeader
        title={`Karibu, ${currentFarmer.name.split(" ")[0]}`}
        description="Monitor produce, sales, and deliveries from one place."
        actions={
          <>
            <CtaButton onClick={() => navigate("/dashboard/farmer/produce")}>List Produce</CtaButton>
            <CtaButton variant="secondary" onClick={() => navigate("/dashboard/farmer/intel")}>
              Ask AI Assistant
            </CtaButton>
          </>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Produce Listed" value={`${(myListings.reduce((s, l) => s + l.quantityKg, 0) / 1000).toFixed(1)}T`} icon={Package} accent="emerald" />
        <StatCard label="Active Orders" value={myOrdersAsFarmer.length} icon={ShoppingCart} accent="blue" />
        <StatCard label="Revenue (MTD)" value={`KES ${(revenue / 1000).toFixed(0)}K`} icon={Wallet} trend="+12% vs last month" accent="violet" />
        <StatCard label="Escrow Pending" value={`KES ${(escrowPending / 1000).toFixed(0)}K`} icon={Wallet} accent="amber" />
        <StatCard label="Crop Health" value="94%" icon={Leaf} sub="Moisture optimal" accent="cyan" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <DashboardCard title="County market price trends" className="lg:col-span-2">
          <ChartContainer>
            <AreaChart data={PRICE_TREND}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGrad)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </DashboardCard>
        <DashboardCard title="AI recommendations">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              List Grade A potatoes this week — Nairobi demand +8%
            </li>
            <li className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              Reduce moisture to 13.5% before Thursday dispatch
            </li>
            <li className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
              Request cold-chain transport for 2.4T batch
            </li>
          </ul>
          <button type="button" onClick={() => navigate("/dashboard/farmer/intel")} className="mt-4 text-sm font-bold text-agri-emerald hover:underline">
            Open Mkulima Intel →
          </button>
        </DashboardCard>
        <DashboardCard title="Active deliveries" className="lg:col-span-2">
          <IntegratedGoogleMap
            center={{ lat: currentFarmer.location.latitude, lng: currentFarmer.location.longitude }}
            zoom={8}
            markers={[
              { id: "f", lat: currentFarmer.location.latitude, lng: currentFarmer.location.longitude, title: "Your farm", role: "FARM" },
              { id: "t", lat: -1.0, lng: 36.7, title: "Truck en route", role: "TRUCK" },
            ]}
            height="200px"
          />
        </DashboardCard>
        <DashboardCard title="Recent activity">
          <ActivityFeed
            items={[
              { id: "1", title: "New order from Nairobi Fresh", time: "2h ago", type: "success" },
              { id: "2", title: "Moisture check passed — Grade A", time: "5h ago", type: "info" },
              { id: "3", title: "Escrow release pending delivery", time: "1d ago", type: "warning" },
            ]}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function FarmerProduce() {
  const { myListings, currentFarmerId, currentFarmer, addListing } = useDashboardData();
  const [cropName, setCropName] = useState("Potatoes");
  const [quantityKg, setQuantityKg] = useState(500);
  const [pricePerKg, setPricePerKg] = useState(42);
  const [moisture, setMoisture] = useState(13.2);
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const listing: ProduceListing = {
      id: `L-${Date.now()}`,
      farmerId: currentFarmerId,
      cropName,
      quantityKg,
      pricePerKgKes: pricePerKg,
      harvestDate: new Date().toISOString().split("T")[0],
      grade: ProduceGrade.GRADE_A,
      moistureContentPct: moisture,
      description: `Fresh ${cropName} from ${currentFarmer.location.county}`,
      spoilageRiskPct: moisture > 14 ? 18 : 6,
      imageUrl: `https://images.unsplash.com/photo-1518977824744-7797548211cc?w=400&auto=format&fit=crop`,
      timestamp: new Date().toISOString(),
      syncStatus: "SYNCED",
    };
    addListing(listing);
    setShowForm(false);
  }

  return (
    <div>
      <PageHeader
        title="My Produce"
        description="List crops, set prices, and track stock availability."
        actions={<CtaButton onClick={() => setShowForm(true)}>+ Add listing</CtaButton>}
      />
      {showForm && (
        <DashboardCard title="New crop listing" className="mb-6">
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <input className="border rounded-xl px-3 py-2 text-sm" placeholder="Crop name" value={cropName} onChange={(e) => setCropName(e.target.value)} />
            <input type="number" className="border rounded-xl px-3 py-2 text-sm" placeholder="Quantity (kg)" value={quantityKg} onChange={(e) => setQuantityKg(+e.target.value)} />
            <input type="number" className="border rounded-xl px-3 py-2 text-sm" placeholder="Price KES/kg" value={pricePerKg} onChange={(e) => setPricePerKg(+e.target.value)} />
            <input type="number" step="0.1" className="border rounded-xl px-3 py-2 text-sm" placeholder="Moisture %" value={moisture} onChange={(e) => setMoisture(+e.target.value)} />
            <p className="sm:col-span-2 text-xs text-slate-500">Location: {currentFarmer.location.county}, {currentFarmer.location.subCounty}</p>
            <div className="sm:col-span-2 flex gap-2">
              <CtaButton>List produce</CtaButton>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm">Cancel</button>
            </div>
          </form>
        </DashboardCard>
      )}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myListings.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-36 bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url(${l.imageUrl || ""})` }} />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900">{l.cropName}</h3>
                <StatusChip status={l.moistureContentPct <= 13.5 ? "optimal" : "alert"} />
              </div>
              <p className="text-agri-emerald font-bold mt-1">KES {l.pricePerKgKes}/kg</p>
              <p className="text-sm text-slate-500 mt-1">{l.quantityKg.toLocaleString()} kg available</p>
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-slate-500">Moisture {l.moistureContentPct}%</span>
                <span className="font-semibold text-blue-600">Demand {100 - l.spoilageRiskPct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FarmerOrders() {
  const { myOrdersAsFarmer } = useDashboardData();
  return (
    <div>
      <PageHeader title="Orders" description="Track incoming orders, escrow, and delivery progress." />
      <div className="space-y-4">
        {myOrdersAsFarmer.length === 0 ? (
          <DashboardCard>
            <p className="text-slate-500 text-sm">No orders yet. List produce to attract buyers.</p>
          </DashboardCard>
        ) : (
          myOrdersAsFarmer.map((o) => (
            <div key={o.id}>
            <DashboardCard>
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold">Order #{o.id}</h3>
                  <p className="text-sm text-slate-500">{o.totalQuantityKg} kg · KES {o.totalCostKes.toLocaleString()}</p>
                </div>
                <StatusChip status={o.status === CargoStatus.DELIVERED ? "delivered" : "escrow"} />
              </div>
              <div className="flex flex-wrap gap-2">
                {ORDER_STEPS.map((step, i) => (
                  <span key={step} className={`text-[10px] px-2 py-1 rounded-full ${i < 3 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                    {step}
                  </span>
                ))}
              </div>
            </DashboardCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function FarmerMarket() {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<any>(null);
  useEffect(() => {
    fetch("/api/predict-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cropName: "Potatoes", county: "Nyandarua", grade: "A" }),
    })
      .then((r) => r.json())
      .then(setPrediction)
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <PageHeader title="Market Insights" description="AI-powered pricing, demand forecasts, and county analytics." />
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <DashboardCard title="County pricing trends">
          <ChartContainer className="h-64 min-h-[240px] w-full">
            <LineChart data={prediction?.historicalPricing || PRICE_TREND}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="priceKes"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardCard>
        <DashboardCard title="Demand by county">
          <ChartContainer className="h-64 min-h-[240px] w-full">
            <BarChart data={DEMAND_FORECAST}>
              <XAxis dataKey="county" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="demand" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </DashboardCard>
      </div>
      {prediction && (
        <DashboardCard title="AI price prediction" className="mb-6">
          <p className="text-2xl font-bold text-agri-emerald">KES {prediction.predictedPricePerKg}/kg</p>
          <p className="text-sm text-slate-500 mt-1">Best county to sell: Nairobi (+20% premium)</p>
        </DashboardCard>
      )}
      <CtaButton onClick={() => navigate("/dashboard/farmer/intel")}>Open crop recommendation engine</CtaButton>
    </div>
  );
}

export function FarmerIntel() {
  return (
    <div>
      <PageHeader title="Mkulima Intel" description="Gemini-powered farming assistant in English & Kiswahili." />
      <MkulimaChat />
    </div>
  );
}

export function FarmerPayments() {
  const { myOrdersAsFarmer } = useDashboardData();
  const rows = [
    { id: "1", amount: 124000, status: "released" as const, date: "May 24" },
    { id: "2", amount: 89000, status: "escrow" as const, date: "May 26" },
    { id: "3", amount: 45000, status: "pending" as const, date: "May 27" },
  ];
  return (
    <div>
      <PageHeader title="Payments" description="Escrow tracking, M-PESA payouts, and revenue analytics." />
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Released (MTD)" value="KES 213K" icon={Wallet} accent="emerald" />
        <StatCard label="In escrow" value="KES 89K" icon={Wallet} accent="blue" />
        <StatCard label="Pending" value="KES 45K" icon={Wallet} accent="amber" />
      </div>
      <DashboardCard title="Transaction history">
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-semibold">M-PESA payout · {r.date}</p>
                <p className="text-xs text-slate-500">Order settlement</p>
              </div>
              <div className="text-right">
                <p className="font-bold">KES {r.amount.toLocaleString()}</p>
                <StatusChip status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

export function FarmerStorage() {
  const { warehouses } = useDashboardData();
  const w = warehouses[0];
  return (
    <div>
      <PageHeader title="Storage & Quality" description="Moisture checks, warehouse conditions, and spoilage alerts." />
      <div className="grid md:grid-cols-2 gap-6">
        <DashboardCard title="Warehouse conditions">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
              <Droplets className="w-5 h-5 text-cyan-600 mb-2" />
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="text-2xl font-bold">{w?.humidityPct ?? 62}%</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs text-slate-500">Temperature</p>
              <p className="text-2xl font-bold">{w?.temperatureCelsius ?? 8}°C</p>
            </div>
          </div>
          <StatusChip status="optimal" />
        </DashboardCard>
        <DashboardCard title="Moisture alerts">
          <ActivityFeed
            items={[
              { id: "1", title: "Maize batch OK — 13.2%", time: "Today", type: "success" },
              { id: "2", title: "Potato storage temp stable", time: "Yesterday", type: "info" },
            ]}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function FarmerNotifications() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <DashboardCard>
        <ActivityFeed
          items={[
            { id: "1", title: "New buyer order #ORD-8821", time: "10 min ago", type: "success" },
            { id: "2", title: "Driver assigned to your shipment", time: "1h ago", type: "info" },
            { id: "3", title: "Moisture alert cleared", time: "3h ago", type: "success" },
            { id: "4", title: "Price spike in Nairobi — list now", time: "5h ago", type: "warning" },
          ]}
        />
      </DashboardCard>
    </div>
  );
}

export function FarmerProfile() {
  const { user } = useAuth();
  const { currentFarmer } = useDashboardData();
  return (
    <div>
      <PageHeader title="Profile" />
      <DashboardCard>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Name</dt><dd className="font-semibold">{currentFarmer.name}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user?.email}</dd></div>
          <div><dt className="text-slate-500">County</dt><dd className="font-semibold">{currentFarmer.location.county}</dd></div>
          <div><dt className="text-slate-500">Primary crop</dt><dd className="font-semibold">{currentFarmer.primaryCrop}</dd></div>
          <div><dt className="text-slate-500">Farm size</dt><dd className="font-semibold">{currentFarmer.farmSizeAcres} acres</dd></div>
          <div><dt className="text-slate-500">KYC</dt><dd><StatusChip status="optimal" /></dd></div>
        </dl>
      </DashboardCard>
    </div>
  );
}
