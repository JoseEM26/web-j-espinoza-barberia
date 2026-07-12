"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import { api } from "@/lib/api-client";
import type { CutRecord, Pagination } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { CutHistoryList } from "@/components/cuts/cut-history-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCutsPage() {
  const { user, authorized } = useRequireRole("ADMIN");
  const [page, setPage] = useState(1);
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);
  const [cuts, setCuts] = useState<CutRecord[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "20",
          onlyUnpaid: String(onlyUnpaid),
        });
        const data = await api.get<{ cuts: CutRecord[]; pagination: Pagination }>(
          `/admin/cuts?${params.toString()}`,
        );
        setCuts(data.cuts);
        setPagination(data.pagination);
      } catch {
        toast.error("No se pudo cargar el historial de cortes.");
      }
    })();
  }, [authorized, page, onlyUnpaid, refreshKey]);

  if (!authorized || !user) return <SplashScreen />;

  function reload() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-elegant text-2xl italic text-gold-200">Todos los cortes</p>
            <p className="text-sm text-foreground/50">
              Historial completo de la barbería.
              {pagination && ` ${pagination.total} en total.`}
            </p>
          </div>
          <Button
            variant={onlyUnpaid ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setPage(1);
              setOnlyUnpaid((v) => !v);
            }}
          >
            <Wallet /> Solo fiados por pagar
          </Button>
        </div>

        {!cuts ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <CutHistoryList
              cuts={cuts}
              showClient
              emptyMessage="No hay cortes registrados todavía."
              canEditPayment
              onChanged={reload}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft />
                </Button>
                <span className="text-sm text-foreground/50">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
