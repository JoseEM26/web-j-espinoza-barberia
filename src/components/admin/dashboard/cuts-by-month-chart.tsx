"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CutsByMonthItem } from "@/lib/stats-types";
import { Skeleton } from "@/components/ui/skeleton";

interface CutsByMonthChartProps {
  data: CutsByMonthItem[];
  loading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-md">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-primary">
          {payload[0].value} corte{payload[0].value === 1 ? "" : "s"}
        </p>
      </div>
    );
  }
  return null;
}

export function CutsByMonthChart({ data, loading }: CutsByMonthChartProps) {
  if (loading) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-1 h-3.5 w-60" />
        </div>
        <Skeleton className="mt-6 h-64 w-full rounded-xl" />
      </div>
    );
  }

  const totalCutsInPeriod = data.reduce((acc, curr) => acc + curr.cuts, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">
            Cortes por Mes
          </h4>
          <p className="text-xs text-muted">Historial completo de los últimos 12 meses</p>
        </div>
        <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-primary">
          {totalCutsInPeriod} en total
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          No hay datos de cortes registrados.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EADFD3" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#8A7868"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#EADFD3" }}
              />
              <YAxis
                stroke="#8A7868"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cuts"
                fill="#7A4A2B"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
