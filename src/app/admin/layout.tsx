"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Scissors, QrCode } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import { SplashScreen } from "@/components/brand/splash-screen";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/dashboard/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authorized } = useRequireRole("ADMIN");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!authorized || !user) {
    return <SplashScreen />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Hide any global AppHeader if rendered elsewhere inside admin subtree */}
      <style global jsx>{`
        header.sticky.top-0 {
          display: none !important;
        }
      `}</style>

      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64">
        <AdminSidebar className="w-64" />
      </div>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-dark/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1">
            <AdminSidebar
              className="w-full"
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="border-border text-foreground hover:bg-surface-2"
              title="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <Link href="/admin">
              <Logo className="text-xl" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/cuts">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border text-xs text-muted hover:text-primary"
              >
                <Scissors className="size-3.5" />
                <span className="hidden sm:inline">Cortes</span>
              </Button>
            </Link>
            <Link href="/admin/qr">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border text-xs text-muted hover:text-primary"
              >
                <QrCode className="size-3.5" />
                <span className="hidden sm:inline">QR</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
