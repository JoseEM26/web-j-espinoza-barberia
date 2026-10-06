"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRequireRole } from "@/lib/use-require-role";
import { api } from "@/lib/api-client";
import type { CardStatus, CutRecord } from "@/lib/types";
import type { UserStatsResponse } from "@/lib/stats-types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { LoyaltyCard } from "@/components/dashboard/loyalty-card";
import { CutHistoryList } from "@/components/cuts/cut-history-list";
import { UserStatsKpis } from "@/components/dashboard/charts/user-stats-kpis";
import { UserCutsBarChart } from "@/components/dashboard/charts/user-cuts-bar-chart";
import { UserSpendAreaChart } from "@/components/dashboard/charts/user-spend-area-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialFooter } from "@/components/layout/social-footer";

export default function DashboardPage() {
  const { user, authorized } = useRequireRole("CLIENT");
  const [card, setCard] = useState<CardStatus | null>(null);
  const [cuts, setCuts] = useState<CutRecord[] | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const [cardRes, cutsRes, statsRes] = await Promise.all([
          api.get<{ card: CardStatus }>("/users/me/card"),
          api.get<{ cuts: CutRecord[] }>("/users/me/cuts"),
          api.get<UserStatsResponse>("/users/me/stats").catch(() => null),
        ]);
        setCard(cardRes.card);
        setCuts(cutsRes.cuts);
        if (statsRes) {
          setStats(statsRes);
        }
      } catch {
        toast.error("No se pudo cargar tu información.");
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [authorized]);

  if (!authorized || !user) return <SplashScreen />;

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#FAF7F3]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Client Greeting Card */}
        <section className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-12 sm:size-14 ring-2 ring-sand-light shadow-2xs">
              <AvatarImage
                src={user.avatarBase64 ?? undefined}
                alt={user.fullName}
              />
              <AvatarFallback className="font-display text-lg text-primary">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Hola, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Bienvenido a tu panel de fidelidad y turnos
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-primary">
            @{user.username}
          </span>
        </section>

        {/* Loyalty Card */}
        {card ? (
          <LoyaltyCard card={card} />
        ) : (
          <Skeleton className="h-64 w-full rounded-2xl" />
        )}

        {/* Quick KPI Stats */}
        {stats?.totals ? (
          <UserStatsKpis totals={stats.totals} />
        ) : loadingStats ? (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : null}

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserCutsBarChart
            data={stats?.cutsByMonth ?? []}
            isLoading={loadingStats}
          />
          <UserSpendAreaChart
            data={stats?.spendCumulativeByMonth ?? []}
            totalSpent={stats?.totals?.totalSpent}
            isLoading={loadingStats}
          />
        </section>

        {/* Cut History Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Historial de cortes
              </h2>
              <p className="text-xs text-muted">Tus visitas y cortes registrados</p>
            </div>
            {cuts && cuts.length > 0 && (
              <span className="text-xs font-semibold text-primary bg-surface-2 border border-border px-2.5 py-1 rounded-lg">
                {cuts.length} {cuts.length === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>

          {cuts ? (
            <CutHistoryList cuts={cuts} />
          ) : (
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          )}
        </section>

        <SocialFooter />
      </main>
    </div>
  );
}
