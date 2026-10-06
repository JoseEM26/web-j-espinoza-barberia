"use client";

import Link from "next/link";
import type { TopClientItem } from "@/lib/stats-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface TopClientsChartProps {
  clients: TopClientItem[];
  loading: boolean;
}

export function TopClientsChart({ clients, loading }: TopClientsChartProps) {
  if (loading) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-1 h-3.5 w-60" />
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCuts = clients.length > 0 ? Math.max(...clients.map((c) => c.cuts), 1) : 1;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">
            Top Clientes Frecuentes
          </h4>
          <p className="text-xs text-muted">Mayor cantidad de cortes y fidelidad acumulada</p>
        </div>
        <span className="text-xs font-semibold text-primary">Top 5</span>
      </div>

      {clients.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted">
          Aún no hay clientes con cortes registrados.
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client, index) => {
            const percentage = Math.round((client.cuts / maxCuts) * 100);
            const isTop = index === 0;

            return (
              <Link
                key={client.userId}
                href={`/admin/users/${client.userId}`}
                className="group block transition-opacity hover:opacity-95"
              >
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-6 border border-border shrink-0">
                      <AvatarImage src={client.avatarBase64 ?? undefined} alt={client.fullName} />
                      <AvatarFallback className="bg-sand-light text-primary text-[10px] font-bold">
                        {client.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {client.fullName}
                    </span>
                  </div>

                  <span className="font-bold text-primary shrink-0 pl-2">
                    {client.cuts} corte{client.cuts === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full border border-border/60 bg-surface-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? "bg-primary" : index < 3 ? "bg-secondary" : "bg-sand"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
