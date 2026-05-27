import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  FarmerOverview,
  FarmerProduce,
  FarmerOrders,
  FarmerMarket,
  FarmerIntel,
  FarmerPayments,
  FarmerStorage,
  FarmerNotifications,
  FarmerProfile,
} from "./FarmerPages";

export default function FarmerDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="farmer" />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<FarmerOverview />} />
        <Route path="produce" element={<FarmerProduce />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="market" element={<FarmerMarket />} />
        <Route path="intel" element={<FarmerIntel />} />
        <Route path="payments" element={<FarmerPayments />} />
        <Route path="storage" element={<FarmerStorage />} />
        <Route path="notifications" element={<FarmerNotifications />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Route>
    </Routes>
  );
}
