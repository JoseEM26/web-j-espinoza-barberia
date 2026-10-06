export interface CutsByMonthItem {
  month: string; // e.g. "2026-05"
  label: string; // e.g. "May"
  cuts: number;
}

export interface SpendCumulativeByMonthItem {
  month: string; // e.g. "2026-05"
  label: string; // e.g. "May"
  spend: number;
  cumulative: number;
}

export interface UserStatsTotals {
  totalCuts: number;
  completedCycles: number;
  lastCutDaysAgo: number | null;
  totalSpent: number;
}

export interface UserStatsResponse {
  cutsByMonth: CutsByMonthItem[];
  spendCumulativeByMonth: SpendCumulativeByMonthItem[];
  totals: UserStatsTotals;
}

export interface KpiMetric {
  value: number;
  changePercentage: number | null;
}

export interface AdminStatsKpis {
  activeClients: KpiMetric;
  cutsThisMonth: KpiMetric;
  revenueThisMonth: KpiMetric;
  freeCutsRedeemed: KpiMetric;
}

export interface RevenueByMonthItem {
  month: string; // e.g. "2025-11"
  label: string; // e.g. "Nov"
  revenue: number;
}

export interface PaidVsPending {
  paid: number;
  pending: number;
  free: number;
}

export interface TopClientItem {
  userId: string;
  fullName: string;
  avatarBase64: string | null;
  cuts: number;
}

export type RecentCutStatus = "PAID" | "PENDING" | "FREE";

export interface RecentCutItem {
  id: string;
  client: {
    id: string;
    fullName: string;
    username: string;
  };
  date: string;
  amount: number;
  estado: RecentCutStatus;
}

export interface AdminStatsResponse {
  kpis: AdminStatsKpis;
  cutsByMonth: CutsByMonthItem[];
  revenueByMonth: RevenueByMonthItem[];
  paidVsPending: PaidVsPending;
  topClients: TopClientItem[];
  recentCuts: RecentCutItem[];
}
