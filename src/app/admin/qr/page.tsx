"use client";

import { useRequireRole } from "@/lib/use-require-role";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { QrCodePanel } from "@/components/admin/qr-code-panel";

export default function AdminQrPage() {
  const { user, authorized } = useRequireRole("ADMIN");

  if (!authorized || !user) return <SplashScreen />;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold italic text-primary">Código QR</h1>
          <p className="mt-1 text-sm text-muted">
            Imprímelo y pégalo en la barbería para que tus clientes escaneen e ingresen directo.
          </p>
        </div>

        <QrCodePanel />
      </main>
    </div>
  );
}
