import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { PUBLIC_ROUTES, PublicPage, publicPageFromPath } from "../types/navigation";
import AuthGate from "../components/auth/AuthGate";

export default function PublicSite() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuthModal, logout } = useAuth();
  const currentPage = publicPageFromPath(location.pathname);

  function onNavigate(page: PublicPage) {
    navigate(PUBLIC_ROUTES[page]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onEnterMarketplace() {
    navigate("/dashboard/buyer");
  }

  return (
    <>
      <AuthGate />
      <PublicLayout
        currentPage={currentPage}
        onNavigate={onNavigate}
        onEnterMarketplace={onEnterMarketplace}
        onLogin={openAuthModal}
        currentUser={user}
        onSignOut={logout}
      >
        <Outlet />
      </PublicLayout>
    </>
  );
}
