import type { UserStatsTotals } from "@/lib/stats-types";
import { Card, CardContent } from "@/components/ui/card";

export function UserStatsKpis({ totals }: { totals: UserStatsTotals }) {
  return (
    <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {/* Cortes totales */}
      <Card className="rounded-xl border border-border bg-white shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 text-center">
          <p className="text-[11px] sm:text-xs font-medium text-muted">Cortes totales</p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-primary">
            {totals.totalCuts}
          </p>
          <span className="mt-0.5 text-[9px] sm:text-[10px] text-muted">Histórico</span>
        </CardContent>
      </Card>

      {/* Ciclos completados */}
      <Card className="rounded-xl border border-border bg-white shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 text-center">
          <p className="text-[11px] sm:text-xs font-medium text-muted">Ciclos</p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-primary">
            {totals.completedCycles}
          </p>
          <span className="mt-1 inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[9px] sm:text-[10px] font-semibold text-emerald-800">
            Completos
          </span>
        </CardContent>
      </Card>

      {/* Último corte */}
      <Card className="rounded-xl border border-border bg-white shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 text-center">
          <p className="text-[11px] sm:text-xs font-medium text-muted">Último corte</p>
          <p className="mt-1 font-sans text-base sm:text-xl font-bold text-foreground">
            {totals.lastCutDaysAgo !== null
              ? totals.lastCutDaysAgo === 0
                ? "Hoy"
                : `Hace ${totals.lastCutDaysAgo}d`
              : "—"}
          </p>
          <span className="mt-0.5 text-[9px] sm:text-[10px] text-muted">
            {totals.lastCutDaysAgo !== null ? "Registrado" : "Sin cortes"}
          </span>
        </CardContent>
      </Card>
    </section>
  );
}
