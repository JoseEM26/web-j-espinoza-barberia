"use client";

import { Users, Scissors, DollarSign, Gift, TrendingUp, TrendingDown } from "lucide-react";
import type { AdminStatsKpis } from "@/lib/stats-types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  kpis: AdminStatsKpis | null;
  loading: boolean;
}

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-2 h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Clientes Activos",
      value: kpis.activeClients.value.toLocaleString("es-PE"),
      unit: "con cuenta",
      change: kpis.activeClients.changePercentage,
      icon: Users,
    },
    {
      title: "Cortes del Mes",
      value: kpis.cutsThisMonth.value.toLocaleString("es-PE"),
      unit: "servicios",
      change: kpis.cutsThisMonth.changePercentage,
      icon: Scissors,
    },
    {
      title: "Ingresos del Mes",
      value: `S/ ${kpis.revenueThisMonth.value.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      unit: "facturado",
      change: kpis.revenueThisMonth.changePercentage,
      icon: DollarSign,
    },
    {
      title: "Descuentos Canjeados",
      value: kpis.freeCutsRedeemed.value.toLocaleString("es-PE"),
      unit: "beneficios",
      change: kpis.freeCutsRedeemed.changePercentage,
      icon: Gift,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChange = item.change !== null;
        const isPositive = (item.change ?? 0) >= 0;

        return (
          <div
            key={item.title}
            className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-primary">
                <Icon className="size-5" />
              </div>

              {hasChange ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border",
                    isPositive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700",
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {isPositive ? `+${item.change}%` : `${item.change}%`}
                </span>
              ) : (
                <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                  Sin hist.
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {item.title}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <h3 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {item.value}
                </h3>
                <span className="text-xs text-muted font-medium">{item.unit}</span>
              </div>
            </div>

            <div className="mt-3 border-t border-surface-2 pt-2.5 text-xs text-muted flex items-center justify-between">
              <span>vs. mes anterior</span>
              <span className="font-medium text-foreground">
                {hasChange ? (isPositive ? "Crecimiento" : "Reducción") : "Primer mes"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
