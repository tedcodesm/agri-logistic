import React from "react";
import { Truck, MapPin, DollarSign, Fuel, Star, Check, X } from "lucide-react";
import { useDashboardData } from "../../context/DashboardDataContext";
import { useAuth } from "../../context/AuthContext";
import { StatCard, PageHeader, DashboardCard, StatusChip } from "../../components/dashboard/ui";
import IntegratedGoogleMap from "../../components/IntegratedGoogleMap";
import DriversPanel from "../../components/DriversPanel";

export function DriverOverview() {
  const { myTrips, currentDriver, vehicles } = useDashboardData();
  const vehicle = vehicles.find((v) => v.id === currentDriver.vehicleId);

  return (
    <div>
      <PageHeader
        title={`Hello, ${currentDriver.name.split(" ")[0]}`}
        description="Assignments, routes, and earnings at a glance."
      />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Deliveries today" value={myTrips.length || 3} icon={Truck} accent="amber" />
        <StatCard label="Distance" value="186 km" icon={MapPin} accent="cyan" />
        <StatCard label="Earnings" value={`KES ${currentDriver.walletBalance.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard label="Fuel efficiency" value={`${vehicle?.fuelEfficiencyKmpl ?? 8.2} km/L`} icon={Fuel} accent="blue" />
        <StatCard label="Rating" value="4.9" icon={Star} trend="127 trips" accent="violet" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardCard title="Next delivery">
          <p className="font-bold text-lg">Nyandarua → Nairobi</p>
          <p className="text-sm text-slate-500 mt-1">2.4T potatoes · Cold chain</p>
          <StatusChip status="transit" />
          <p className="text-agri-emerald font-bold mt-4">ETA 2h 14m</p>
        </DashboardCard>
        <DashboardCard title="Route summary">
          <IntegratedGoogleMap
            center={{ lat: currentDriver.currentLat, lng: currentDriver.currentLng }}
            zoom={8}
            markers={[
              { id: "d", lat: currentDriver.currentLat, lng: currentDriver.currentLng, title: "You", role: "TRUCK" },
              { id: "e", lat: -1.29, lng: 36.82, title: "Drop-off", role: "BUYER" },
            ]}
            height="180px"
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function DriverDeliveries() {
  const { drivers, vehicles, orders, activeTrips, currentDriverId, addTrip, updateTripIndex, completeTrip } =
    useDashboardData();

  return (
    <div>
      <PageHeader title="Assigned deliveries" description="Accept jobs, view cargo, and update status." />
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { id: "job-1", farmer: "Grace Wanjiku", buyer: "Nairobi Fresh", weight: "2,400 kg", escrow: "escrow" as const },
          { id: "job-2", farmer: "Mary Atieno", buyer: "Eldoret Millers", weight: "1,100 kg", escrow: "pending" as const },
        ].map((job) => (
          <div key={job.id}>
          <DashboardCard>
            <div className="flex justify-between mb-3">
              <h3 className="font-bold">Delivery {job.id}</h3>
              <StatusChip status={job.escrow} />
            </div>
            <p className="text-sm text-slate-600">From: {job.farmer}</p>
            <p className="text-sm text-slate-600">To: {job.buyer}</p>
            <p className="text-sm font-semibold mt-2">{job.weight}</p>
            <div className="flex gap-2 mt-4">
              <button type="button" className="flex-1 py-2 rounded-xl bg-agri-emerald text-white text-sm font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Accept
              </button>
              <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          </DashboardCard>
          </div>
        ))}
      </div>
      <DriversPanel
        drivers={drivers}
        vehicles={vehicles}
        orders={orders}
        activeTrips={activeTrips.filter((t) => t.driverId === currentDriverId)}
        onAddTrip={addTrip}
        onUpdateTripIndex={updateTripIndex}
        onCompleteTrip={completeTrip}
      />
    </div>
  );
}

export function DriverNavigation() {
  const { currentDriver } = useDashboardData();
  return (
    <div>
      <PageHeader title="Route navigation" description="Live navigation, checkpoints, and ETA updates." />
      <DashboardCard className="mb-6">
        <IntegratedGoogleMap
          center={{ lat: currentDriver.currentLat, lng: currentDriver.currentLng }}
          zoom={9}
          markers={[
            { id: "1", lat: -0.64, lng: 36.61, title: "Pickup", role: "COLLECTION" },
            { id: "2", lat: currentDriver.currentLat, lng: currentDriver.currentLng, title: "Current", role: "TRUCK" },
            { id: "3", lat: -1.29, lng: 36.82, title: "Destination", role: "BUYER" },
          ]}
          height="400px"
        />
      </DashboardCard>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="ETA" value="2h 14m" icon={MapPin} accent="cyan" />
        <StatCard label="Traffic" value="Light" icon={Truck} accent="emerald" />
        <StatCard label="Checkpoints" value="2/4" icon={MapPin} accent="blue" />
      </div>
    </div>
  );
}

export function DriverEarnings() {
  const { currentDriver } = useDashboardData();
  const weekly = [
    { day: "Mon", amount: 4200 },
    { day: "Tue", amount: 5800 },
    { day: "Wed", amount: 6100 },
    { day: "Thu", amount: 4500 },
    { day: "Fri", amount: 7200 },
  ];
  return (
    <div>
      <PageHeader title="Earnings" description="Trip earnings, payouts, and incentives." />
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="This week" value="KES 27.8K" icon={DollarSign} accent="emerald" />
        <StatCard label="Incentives" value="KES 2.1K" icon={DollarSign} accent="violet" />
        <StatCard label="Fuel reimburse" value="KES 4.5K" icon={Fuel} accent="amber" />
      </div>
      <DashboardCard title="Daily breakdown">
        <ul className="space-y-2">
          {weekly.map((d) => (
            <li key={d.day} className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span>{d.day}</span>
              <span className="font-bold">KES {d.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}

export function DriverVehicle() {
  const { vehicles, currentDriver } = useDashboardData();
  const v = vehicles.find((x) => x.id === currentDriver.vehicleId) ?? vehicles[0];
  return (
    <div>
      <PageHeader title="Vehicle status" description="Truck health, temperature, and maintenance." />
      <div className="grid md:grid-cols-2 gap-6">
        <DashboardCard title={v.plateNumber}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="font-semibold">{v.type.replace(/_/g, " ")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Capacity</dt><dd className="font-semibold">{v.payloadCapacityKg} kg</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Current load</dt><dd className="font-semibold">{v.currentLoadKg} kg</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Cold chain</dt><dd>{v.tempControlled ? <StatusChip status="optimal" /> : "—"}</dd></div>
          </dl>
        </DashboardCard>
        <DashboardCard title="Telemetry">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cyan-50"><p className="text-xs text-slate-500">Cargo temp</p><p className="text-2xl font-bold">4.2°C</p></div>
            <div className="p-4 rounded-xl bg-emerald-50"><p className="text-xs text-slate-500">Fuel</p><p className="text-2xl font-bold">68%</p></div>
          </div>
          <p className="text-xs text-amber-600 mt-4 font-medium">Next inspection due in 12 days</p>
        </DashboardCard>
      </div>
    </div>
  );
}

export function DriverNotifications() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <DashboardCard>
        <ul className="space-y-3 text-sm">
          <li className="p-3 rounded-xl bg-amber-50 border border-amber-100">New delivery assigned — Nyandarua pickup 14:00</li>
          <li className="p-3 rounded-xl bg-slate-50">Route optimized — save 18 min via Naivasha</li>
        </ul>
      </DashboardCard>
    </div>
  );
}

export function DriverProfile() {
  const { user } = useAuth();
  const { currentDriver } = useDashboardData();
  return (
    <div>
      <PageHeader title="Profile" />
      <DashboardCard>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Name</dt><dd className="font-semibold">{currentDriver.name}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user?.email}</dd></div>
          <div><dt className="text-slate-500">License</dt><dd className="font-semibold">{currentDriver.licenseNumber}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd className="font-semibold capitalize">{currentDriver.status.replace("_", " ")}</dd></div>
        </dl>
      </DashboardCard>
    </div>
  );
}
