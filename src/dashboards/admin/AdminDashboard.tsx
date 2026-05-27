import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { AdminOverview, AdminOperations, AdminWarehouses, AdminProfile } from "./AdminPages";

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout role="admin" />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="operations" element={<AdminOperations />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}
