"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { RevenueByMonthItem } from "@/lib/stats-types";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueByMonthChartProps {
  data: RevenueByMonthItem[];
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
          S/ {payload[0].value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueByMonthChart({ data, loading }: RevenueByMonthChartProps) {
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

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">
            Ingresos por Mes
          </h4>
          <p className="text-xs text-muted">Evolución de facturación mensual (12 meses)</p>
        </div>
        <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-primary">
          S/ {totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          No hay datos de ingresos registrados.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueCoffeeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7A4A2B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7A4A2B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(val) => `S/${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7A4A2B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueCoffeeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
