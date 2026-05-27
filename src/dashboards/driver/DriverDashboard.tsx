import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  DriverOverview,
  DriverDeliveries,
  DriverNavigation,
  DriverEarnings,
  DriverVehicle,
  DriverNotifications,
  DriverProfile,
} from "./DriverPages";

export default function DriverDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="driver" />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DriverOverview />} />
        <Route path="deliveries" element={<DriverDeliveries />} />
        <Route path="navigation" element={<DriverNavigation />} />
        <Route path="earnings" element={<DriverEarnings />} />
        <Route path="vehicle" element={<DriverVehicle />} />
        <Route path="notifications" element={<DriverNotifications />} />
        <Route path="profile" element={<DriverProfile />} />
      </Route>
    </Routes>
  );
}
