"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Wallet } from "lucide-react";
import type { SpendCumulativeByMonthItem } from "@/lib/stats-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const emptySubscribe = () => () => {};

export function UserSpendAreaChart({
  data,
  totalSpent,
  isLoading,
}: {
  data: SpendCumulativeByMonthItem[];
  totalSpent?: number;
  isLoading?: boolean;
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const lastCumulative =
    data.length > 0 ? data[data.length - 1].cumulative : 0;
  const displayTotal = totalSpent !== undefined ? totalSpent : lastCumulative;

  return (
    <Card className="rounded-2xl border border-border bg-white shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">
            Gasto acumulado
          </CardTitle>
          <p className="text-[11px] text-muted">Inversión en cortes (Últimos 6 meses)</p>
        </div>
        <div className="text-right">
          <span className="font-sans text-sm font-extrabold text-primary">
            S/ {displayTotal.toFixed(2)}
          </span>
          <span className="block text-[9px] text-muted">Total acumulado</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {!isMounted || isLoading ? (
          <div className="h-44 w-full animate-pulse rounded-xl bg-surface-2/60" />
        ) : lastCumulative === 0 && displayTotal === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center text-muted">
            <Wallet className="size-6 text-sand" />
            <p className="text-xs">No hay gastos registrados en este período.</p>
          </div>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="userSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A4A2B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FAF7F3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#FAF7F3"
                  vertical={false}
                />
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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const amount = Number(payload[0].value);
                      return (
                        <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
                          <p className="text-xs font-semibold text-foreground">
                            {label}
                          </p>
                          <p className="text-xs font-bold text-primary">
                            S/ {amount.toFixed(2)} acumulado
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#7A4A2B"
                  strokeWidth={2.5}
                  fill="url(#userSpendGrad)"
                  dot={{
                    r: 3,
                    fill: "#FFFFFF",
                    stroke: "#7A4A2B",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "#7A4A2B",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
