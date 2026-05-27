import React from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import { PublicPage } from "../../types/navigation";

interface PublicLayoutProps {
  currentPage: PublicPage;
  onNavigate: (page: PublicPage) => void;
  onEnterMarketplace: () => void;
  onLogin: () => void;
  currentUser?: { name: string; role: string } | null;
  onSignOut?: () => void;
  children: React.ReactNode;
}

export default function PublicLayout({
  currentPage,
  onNavigate,
  onEnterMarketplace,
  onLogin,
  currentUser,
  onSignOut,
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onEnterMarketplace={onEnterMarketplace}
        onLogin={onLogin}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter onNavigate={onNavigate} onEnterMarketplace={onEnterMarketplace} />
    </div>
  );
}
