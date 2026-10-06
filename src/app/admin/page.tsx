"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api-client";
import type { AdminUserListItem, Pagination } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { CutsByMonthChart } from "@/components/admin/dashboard/cuts-by-month-chart";
import { RevenueByMonthChart } from "@/components/admin/dashboard/revenue-by-month-chart";
import { PaidVsPendingChart } from "@/components/admin/dashboard/paid-vs-pending-chart";
import { TopClientsChart } from "@/components/admin/dashboard/top-clients-chart";
import { RecentCutsPanel } from "@/components/admin/dashboard/recent-cuts-panel";
import type { AdminStatsResponse } from "@/lib/stats-types";

type StatusFilter = "all" | "active" | "blocked";

export default function AdminDashboardPage() {
  // Stats state
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Clients directory state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserListItem[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Fetch admin stats
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setStatsLoading(true);
        const data = await api.get<AdminStatsResponse>("/admin/stats");
        if (isMounted) {
          setStats(data);
        }
      } catch {
        toast.error("No se pudieron cargar las estadísticas del negocio.");
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch users directory with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          status,
          page: String(page),
          pageSize: "20",
        });
        if (search) params.set("search", search);
        const data = await api.get<{ users: AdminUserListItem[]; pagination: Pagination }>(
          `/admin/users?${params.toString()}`,
        );
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        toast.error("No se pudo cargar la lista de usuarios.");
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, status, page]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header with Welcome & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h2 className="font-display italic text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Resumen General
          </h2>
          <p className="mt-1 text-sm text-muted">
            Métricas clave, comportamiento de clientes y evolución del negocio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/cuts">
            <Button
              className="gap-2 bg-primary hover:bg-primary-hover text-white shadow-xs"
              size="default"
            >
              <Plus className="size-4" />
              <span>Registrar Corte</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. KPIs Section */}
      <section aria-label="Métricas Principales">
        <KpiCards kpis={stats?.kpis ?? null} loading={statsLoading} />
      </section>

      {/* 2. Charts Row 1: Cuts by Month (12M) + Paid vs Pending (Donut) */}
      <section
        aria-label="Análisis de Cortes y Distribución"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="lg:col-span-8">
          <CutsByMonthChart
            data={stats?.cutsByMonth ?? []}
            loading={statsLoading}
          />
        </div>
        <div className="lg:col-span-4">
          <PaidVsPendingChart
            data={stats?.paidVsPending ?? null}
            loading={statsLoading}
          />
        </div>
      </section>

      {/* 3. Charts Row 2: Monthly Revenue Trend + Top Frequent Clients */}
      <section
        aria-label="Ingresos y Fidelidad por Cliente"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <RevenueByMonthChart
            data={stats?.revenueByMonth ?? []}
            loading={statsLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <TopClientsChart
            clients={stats?.topClients ?? []}
            loading={statsLoading}
          />
        </div>
      </section>

      {/* 4. Recent Cuts Section */}
      <section aria-label="Últimos Cortes Realizados">
        <RecentCutsPanel
          cuts={stats?.recentCuts ?? []}
          loading={statsLoading}
        />
      </section>

      {/* 5. Clients Directory & Management Section (Existing Users Table restyled) */}
      <section
        id="clientes"
        aria-label="Directorio de Clientes"
        className="flex flex-col gap-6 scroll-mt-20 pt-4 border-t border-border/80"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display italic text-2xl font-bold text-foreground">
              Directorio de Clientes
            </h3>
            <p className="text-sm text-muted">
              Busca clientes, revisa sus tarjetas de fidelidad y gestiona sus cuentas.
              {pagination && ` (${pagination.total} registrados)`}
            </p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Buscar por nombre o usuario..."
              maxLength={60}
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9 bg-white border-border focus:bg-white"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v as StatusFilter);
            }}
          >
            <SelectTrigger className="bg-white border-border sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              <SelectItem value="active">Solo activos</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clients List */}
        {!users ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : users.length === 0 ? (
          <Card className="rounded-2xl border-border bg-white shadow-xs">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <UserX className="size-8 text-muted/40 mb-2" />
              <p className="font-medium">No se encontraron clientes.</p>
              <p className="text-xs text-muted mt-0.5">
                Prueba con otro término de búsqueda o cambia el filtro de estado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {users.map((u) => (
                <Link key={u.id} href={`/admin/users/${u.id}`} className="group block">
                  <Card className="h-full rounded-2xl border-border bg-white shadow-xs transition-all hover:border-sand hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4.5">
                      <Avatar className="size-11 shrink-0 border border-border">
                        <AvatarImage src={u.avatarBase64 ?? undefined} alt={u.fullName} />
                        <AvatarFallback className="bg-sand-light text-primary font-bold">
                          {u.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-sans text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {u.fullName}
                          </p>
                          <Badge
                            variant={u.isActive ? "success" : "destructive"}
                            className="text-[11px] font-semibold"
                          >
                            {u.isActive ? (
                              <span className="flex items-center gap-1">
                                <UserCheck className="size-3" />
                                Activo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserX className="size-3" />
                                Bloqueado
                              </span>
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          @{u.username} · {u._count.cuts} corte
                          {u._count.cuts === 1 ? "" : "s"} registrado
                          {u._count.cuts === 1 ? "" : "s"}
                        </p>
                        {!u.isActive && u.blockedReason && (
                          <p className="mt-1 truncate text-xs text-red-600 font-medium">
                            Motivo: {u.blockedReason}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="size-5 shrink-0 text-muted/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border-border bg-white text-foreground hover:bg-surface-2"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-semibold text-muted">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border-border bg-white text-foreground hover:bg-surface-2"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
