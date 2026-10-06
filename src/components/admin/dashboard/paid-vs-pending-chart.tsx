"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PaidVsPending } from "@/lib/stats-types";
import { Skeleton } from "@/components/ui/skeleton";

interface PaidVsPendingChartProps {
  data: PaidVsPending | null;
  loading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-md">
        <p className="text-xs font-semibold text-muted">{payload[0].name}</p>
        <p className="mt-0.5 text-sm font-bold text-foreground">
          {payload[0].value} cortes
        </p>
      </div>
    );
  }
  return null;
}

const COLORS = [
  "#7A4A2B", // Pagados: Marrón Café primario
  "#B08968", // Pendientes: Secundario café suave
  "#D9B99B", // Con descuento: Arena claro
];

export function PaidVsPendingChart({ data, loading }: PaidVsPendingChartProps) {
  if (loading || !data) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-1 h-3.5 w-60" />
        </div>
        <div className="my-6 flex justify-center">
          <Skeleton className="size-44 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const total = data.paid + data.pending + data.free;

  const chartData = [
    { name: "Pagados", value: data.paid },
    { name: "Pendientes (Fiado)", value: data.pending },
    { name: "Con descuento (Lealtad/Cumple)", value: data.free },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div>
        <h4 className="font-display text-lg font-bold text-foreground">
          Distribución de Cortes
        </h4>
        <p className="text-xs text-muted">Relación histórica de pagos y cortes de fidelidad</p>
      </div>

      <div className="relative my-2 flex items-center justify-center">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                innerRadius={54}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-sans text-2xl font-extrabold text-foreground leading-tight">
            {total}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Total cortes
          </span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-border/80 pt-3 text-xs">
        {chartData.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx] }}
                />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-foreground">{item.value}</span>
                <span className="text-muted font-normal">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
