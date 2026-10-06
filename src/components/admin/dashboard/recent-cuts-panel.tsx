"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Scissors, ChevronRight } from "lucide-react";
import type { RecentCutItem } from "@/lib/stats-types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentCutsPanelProps {
  cuts: RecentCutItem[];
  loading: boolean;
}

export function RecentCutsPanel({ cuts, loading }: RecentCutsPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/60 p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">
            Últimos Cortes
          </h4>
          <p className="text-xs text-muted">Transacciones y servicios recientemente registrados</p>
        </div>
        <Link
          href="/admin/cuts"
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          <span>Ver todos</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {cuts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted gap-2">
          <Scissors className="size-8 text-muted/40" />
          <p className="text-sm">Aún no hay cortes registrados en la barbería.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {cuts.map((cut) => {
            const dateObj = new Date(cut.date);
            const formattedDate = format(dateObj, "d 'de' MMMM, h:mm a", { locale: es });

            let badgeVariant: "success" | "secondary" | "warning" = "secondary";
            let statusLabel = "Pagado";

            if (cut.estado === "FREE") {
              badgeVariant = "secondary";
              statusLabel = "Descuento";
            } else if (cut.estado === "PENDING") {
              badgeVariant = "warning";
              statusLabel = "Fiado Pte.";
            } else {
              badgeVariant = "success";
              statusLabel = `S/ ${cut.amount.toFixed(2)}`;
            }

            return (
              <Link
                key={cut.id}
                href={`/admin/users/${cut.client.id}`}
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-surface-2/40 p-3.5 transition-all hover:bg-surface-2 hover:border-sand"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sand-light text-primary border border-border">
                    <Scissors className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cut.client.fullName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      @{cut.client.username} · {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <Badge variant={badgeVariant} className="text-xs font-semibold">
                    {statusLabel}
                  </Badge>
                  <ChevronRight className="size-4 text-muted/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
