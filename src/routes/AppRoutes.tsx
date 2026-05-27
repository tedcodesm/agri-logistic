import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import PublicSite from "../layouts/PublicSite";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { DashboardDataProvider } from "../context/DashboardDataContext";
import FarmerDashboard from "../dashboards/farmer/FarmerDashboard";
import BuyerDashboard from "../dashboards/buyer/BuyerDashboard";
import DriverDashboard from "../dashboards/driver/DriverDashboard";
import AdminDashboard from "../dashboards/admin/AdminDashboard";
import LandingPage from "../components/LandingPage";
import HowItWorksPage from "../pages/HowItWorksPage";
import MarketplacePage from "../pages/MarketplacePage";
import AIAssistantPage from "../pages/AIAssistantPage";
import LogisticsPage from "../pages/LogisticsPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import { useAuth } from "../context/AuthContext";
import { getDashboardHomePath } from "../lib/dashboardPaths";
import AuthModal from "../components/AuthModal";

function PublicLanding() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onEnterMarketplace={() => navigate("/dashboard/buyer")}
      onNavigate={(page) => {
        const paths: Record<string, string> = {
          landing: "/",
          "how-it-works": "/how-it-works",
          marketplace: "/marketplace",
          "ai-assistant": "/ai-assistant",
          logistics: "/logistics",
          about: "/about",
          contact: "/contact",
        };
        navigate(paths[page] || "/");
      }}
    />
  );
}

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={getDashboardHomePath(user.role)} replace />;
}

function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardDataProvider>{children}</DashboardDataProvider>;
}

export default function AppRoutes() {
  const navigate = useNavigate();
  const enterMarketplace = () => navigate("/dashboard/buyer");

  return (
    <>
      <Routes>
        <Route element={<PublicSite />}>
          <Route path="/" element={<PublicLanding />} />
          <Route path="/how-it-works" element={<HowItWorksPage onEnterMarketplace={enterMarketplace} />} />
          <Route path="/marketplace" element={<MarketplacePage onEnterMarketplace={enterMarketplace} />} />
          <Route path="/ai-assistant" element={<AIAssistantPage onEnterMarketplace={enterMarketplace} />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route
          path="/dashboard/farmer/*"
          element={
            <ProtectedRoute requiredRole="farmer">
              <DashboardWrapper>
                <FarmerDashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/buyer/*"
          element={
            <ProtectedRoute requiredRole="buyer">
              <DashboardWrapper>
                <BuyerDashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/driver/*"
          element={
            <ProtectedRoute requiredRole="driver">
              <DashboardWrapper>
                <DriverDashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardWrapper>
                <AdminDashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal />
    </>
  );
}
