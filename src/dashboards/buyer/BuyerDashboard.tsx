import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  BuyerOverview,
  BuyerMarketplace,
  BuyerOrders,
  BuyerLogistics,
  BuyerPayments,
  BuyerSuppliers,
  BuyerNotifications,
  BuyerProfile,
} from "./BuyerPages";

export default function BuyerDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="buyer" />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<BuyerOverview />} />
        <Route path="marketplace" element={<BuyerMarketplace />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="logistics" element={<BuyerLogistics />} />
        <Route path="payments" element={<BuyerPayments />} />
        <Route path="suppliers" element={<BuyerSuppliers />} />
        <Route path="notifications" element={<BuyerNotifications />} />
        <Route path="profile" element={<BuyerProfile />} />
      </Route>
    </Routes>
  );
}
