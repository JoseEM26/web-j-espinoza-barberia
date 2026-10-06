"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Scissors } from "lucide-react";
import type { CutsByMonthItem } from "@/lib/stats-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserCutsBarChartProps {
  data: CutsByMonthItem[];
  isLoading?: boolean;
}

const emptySubscribe = () => () => {};

export function UserCutsBarChart({ data, isLoading }: UserCutsBarChartProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const totalPeriodCuts = data.reduce((acc, curr) => acc + curr.cuts, 0);

  return (
    <Card className="rounded-2xl border border-border bg-white shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">
            Mis cortes por mes
          </CardTitle>
          <p className="text-[11px] text-muted">Últimos 6 meses de actividad</p>
        </div>
        <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Total: {totalPeriodCuts}
        </span>
      </CardHeader>
      <CardContent className="pt-2">
        {!isMounted || isLoading ? (
          <div className="h-44 w-full animate-pulse rounded-xl bg-surface-2/60" />
        ) : totalPeriodCuts === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center text-muted">
            <Scissors className="size-6 text-sand" />
            <p className="text-xs">No hay cortes registrados en los últimos meses.</p>
          </div>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: -22, bottom: 0 }}
              >
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
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#FAF7F3", radius: 6 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const count = Number(payload[0].value);
                      return (
                        <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
                          <p className="text-xs font-semibold text-foreground">
                            {label}
                          </p>
                          <p className="text-xs font-bold text-primary">
                            {count} {count === 1 ? "corte" : "cortes"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="cuts"
                  fill="#7A4A2B"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
