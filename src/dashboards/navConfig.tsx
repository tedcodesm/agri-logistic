import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  BrainCircuit,
  Wallet,
  Thermometer,
  Bell,
  User,
  Store,
  MapPin,
  Shield,
  Users,
  Truck,
  Navigation,
  DollarSign,
  Gauge,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserRole } from "../types/auth";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "farmer":
      return [
        { label: "Dashboard", path: "overview", icon: LayoutDashboard },
        { label: "My Produce", path: "produce", icon: Package },
        { label: "Orders", path: "orders", icon: ShoppingCart },
        { label: "Market Insights", path: "market", icon: TrendingUp },
        { label: "Mkulima Intel", path: "intel", icon: BrainCircuit },
        { label: "Payments", path: "payments", icon: Wallet },
        { label: "Storage & Quality", path: "storage", icon: Thermometer },
        { label: "Notifications", path: "notifications", icon: Bell },
        { label: "Profile", path: "profile", icon: User },
      ];
    case "buyer":
      return [
        { label: "Dashboard", path: "overview", icon: LayoutDashboard },
        { label: "Marketplace", path: "marketplace", icon: Store },
        { label: "Orders", path: "orders", icon: ShoppingCart },
        { label: "Logistics Tracking", path: "logistics", icon: MapPin },
        { label: "Escrow & Payments", path: "payments", icon: Shield },
        { label: "Suppliers", path: "suppliers", icon: Users },
        { label: "Notifications", path: "notifications", icon: Bell },
        { label: "Profile", path: "profile", icon: User },
      ];
    case "driver":
      return [
        { label: "Dashboard", path: "overview", icon: LayoutDashboard },
        { label: "Assigned Deliveries", path: "deliveries", icon: Truck },
        { label: "Route Navigation", path: "navigation", icon: Navigation },
        { label: "Earnings", path: "earnings", icon: DollarSign },
        { label: "Vehicle Status", path: "vehicle", icon: Gauge },
        { label: "Notifications", path: "notifications", icon: Bell },
        { label: "Profile", path: "profile", icon: User },
      ];
    case "admin":
      return [
        { label: "Dashboard", path: "overview", icon: LayoutDashboard },
        { label: "Operations", path: "operations", icon: BarChart3 },
        { label: "Warehouses", path: "warehouses", icon: Thermometer },
        { label: "Profile", path: "profile", icon: User },
      ];
    default:
      return [];
  }
}
