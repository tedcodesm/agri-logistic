import React from "react";
import { useDashboardData } from "../../context/DashboardDataContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, DashboardCard, StatCard } from "../../components/dashboard/ui";
import AdminPanel from "../../components/AdminPanel";
import WarehousesPanel from "../../components/WarehousesPanel";
import { BarChart3, Package, Truck } from "lucide-react";

export function AdminOverview() {
  const { listings, orders, activeTrips } = useDashboardData();
  return (
    <div>
      <PageHeader title="Command center" description="Platform-wide operations overview." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Listings" value={listings.length} icon={Package} accent="emerald" />
        <StatCard label="Orders" value={orders.length} icon={BarChart3} accent="blue" />
        <StatCard label="Active trips" value={activeTrips.length} icon={Truck} accent="amber" />
        <StatCard label="Escrow volume" value={`KES ${(orders.reduce((s, o) => s + o.totalCostKes, 0) / 1000).toFixed(0)}K`} icon={BarChart3} accent="violet" />
      </div>
      <AdminPanel listings={listings} orders={orders} activeTrips={activeTrips} />
    </div>
  );
}

export function AdminOperations() {
  const { listings, orders, activeTrips } = useDashboardData();
  return (
    <div>
      <PageHeader title="Operations" />
      <AdminPanel listings={listings} orders={orders} activeTrips={activeTrips} />
    </div>
  );
}

export function AdminWarehouses() {
  const { warehouses, adjustClimate } = useDashboardData();
  return (
    <div>
      <PageHeader title="Warehouses" />
      <WarehousesPanel warehouses={warehouses} onAdjustClimate={adjustClimate} />
    </div>
  );
}

export function AdminProfile() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Admin profile" />
      <DashboardCard>
        <p className="text-sm"><span className="text-slate-500">Email:</span> <strong>{user?.email}</strong></p>
        <p className="text-sm mt-2"><span className="text-slate-500">Role:</span> <strong>Administrator</strong></p>
      </DashboardCard>
    </div>
  );
}
