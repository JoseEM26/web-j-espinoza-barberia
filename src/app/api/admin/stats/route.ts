import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { getSettings } from "@/lib/settings";
import {
  getMonthBuckets,
  formatMonthKey,
  calculatePercentageChange,
} from "@/lib/stats-utils";
import type {
  AdminStatsResponse,
  CutsByMonthItem,
  RevenueByMonthItem,
  PaidVsPending,
  TopClientItem,
  RecentCutItem,
  RecentCutStatus,
} from "@/lib/stats-types";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const now = new Date();

    // 13 month buckets so index 12 is current month and index 11 is previous month
    // Buckets 1 to 12 (last 12) will form the 12-month series
    const buckets13 = getMonthBuckets(13, now);
    const currentMonthBucket = buckets13[buckets13.length - 1];
    const prevMonthBucket = buckets13[buckets13.length - 2];
    const buckets12 = buckets13.slice(1); // Exactly 12 months ending in current month

    const twelveMonthsAgoStart = buckets12[0].startUTC;
    const prevMonthStart = prevMonthBucket.startUTC;

    const [settings, activeClientsCount, topClientsGroup, recentCutsRaw] = await Promise.all([
      getSettings(),
      // active clients: role CLIENT and isActive true
      prisma.user.count({
        where: {
          role: "CLIENT",
          isActive: true,
        },
      }),
      // Top 5 clients by cut count
      prisma.cut.groupBy({
        by: ["clientId"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      }),
      // Recent 6 cuts
      prisma.cut.findMany({
        take: 6,
        orderBy: { date: "desc" },
        select: {
          id: true,
          type: true,
          amountPaid: true,
          isPaid: true,
          date: true,
          client: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      }),
    ]);

    const defaultCutPrice = settings.cutPrice;

    // Fetch cuts for the last 12 months bounded by date
    // We also need previous month cuts for KPI comparisons, and since prevMonthStart is >= twelveMonthsAgoStart (bucket 11 of 13 is within last 12 months),
    // queries bounded by gte: twelveMonthsAgoStart cover all 12 months AND previous month!
    const cutsIn12Months = await prisma.cut.findMany({
      where: {
        date: { gte: twelveMonthsAgoStart },
      },
      select: {
        type: true,
        amountPaid: true,
        date: true,
      },
    });

    // Counts for paidVsPending (all-time)
    // 1. Paid: NORMAL cuts + FIADO cuts where isPaid is true
    // 2. Pending: FIADO cuts where isPaid is false
    // 3. Free: REWARD_FREE cuts + BIRTHDAY_FREE cuts
    const [paidNormalCount, paidFiadoCount, pendingFiadoCount, rewardFreeCount, birthdayFreeCount] =
      await Promise.all([
        prisma.cut.count({ where: { type: "NORMAL" } }),
        prisma.cut.count({ where: { type: "FIADO", isPaid: true } }),
        prisma.cut.count({ where: { type: "FIADO", isPaid: false } }),
        prisma.cut.count({ where: { type: "REWARD_FREE" } }),
        prisma.cut.count({ where: { type: "BIRTHDAY_FREE" } }),
      ]);

    const paidVsPending: PaidVsPending = {
      paid: paidNormalCount + paidFiadoCount,
      pending: pendingFiadoCount,
      free: rewardFreeCount + birthdayFreeCount,
    };

    // Calculate monthly distributions for the 12 months and KPI numbers
    const cutsCountByMonth: Record<string, number> = {};
    const revenueByMonthMap: Record<string, number> = {};

    for (const b of buckets12) {
      cutsCountByMonth[b.month] = 0;
      revenueByMonthMap[b.month] = 0;
    }

    let cutsCurrentMonth = 0;
    let cutsPrevMonth = 0;
    let revenueCurrentMonth = 0;
    let revenuePrevMonth = 0;
    let freeCutsCurrentMonth = 0;
    let freeCutsPrevMonth = 0;

    for (const cut of cutsIn12Months) {
      const cutDate = new Date(cut.date);
      const mKey = formatMonthKey(cutDate);

      if (cutsCountByMonth[mKey] !== undefined) {
        cutsCountByMonth[mKey] += 1;
      }

      let revenueAmount = 0;
      if (cut.type === "NORMAL") {
        revenueAmount = defaultCutPrice;
      } else if (cut.type === "FIADO") {
        revenueAmount = cut.amountPaid ?? 0;
      }

      if (revenueAmount > 0 && revenueByMonthMap[mKey] !== undefined) {
        revenueByMonthMap[mKey] += revenueAmount;
      }

      // Check current month vs prev month for KPIs
      const isCurrentMonth =
        cutDate >= currentMonthBucket.startUTC && cutDate < currentMonthBucket.endUTC;
      const isPrevMonth =
        cutDate >= prevMonthStart && cutDate < currentMonthBucket.startUTC;

      const isFree = cut.type === "REWARD_FREE" || cut.type === "BIRTHDAY_FREE";

      if (isCurrentMonth) {
        cutsCurrentMonth += 1;
        revenueCurrentMonth += revenueAmount;
        if (isFree) {
          freeCutsCurrentMonth += 1;
        }
      } else if (isPrevMonth) {
        cutsPrevMonth += 1;
        revenuePrevMonth += revenueAmount;
        if (isFree) {
          freeCutsPrevMonth += 1;
        }
      }
    }

    // Active clients comparison (clients registered up to end of previous month)
    const activeClientsPrevMonth = await prisma.user.count({
      where: {
        role: "CLIENT",
        isActive: true,
        createdAt: { lt: currentMonthBucket.startUTC },
      },
    });

    const cutsByMonth: CutsByMonthItem[] = buckets12.map((b) => ({
      month: b.month,
      label: b.label,
      cuts: cutsCountByMonth[b.month] ?? 0,
    }));

    const revenueByMonth: RevenueByMonthItem[] = buckets12.map((b) => ({
      month: b.month,
      label: b.label,
      revenue: Math.round((revenueByMonthMap[b.month] ?? 0) * 100) / 100,
    }));

    // Details for top 5 clients
    const topClientIds = topClientsGroup.map((g) => g.clientId);
    const topUsers = topClientIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: topClientIds } },
          select: {
            id: true,
            fullName: true,
            avatarBase64: true,
          },
        })
      : [];

    const topUsersMap = new Map(topUsers.map((u) => [u.id, u]));

    const topClients: TopClientItem[] = topClientsGroup.map((g) => {
      const u = topUsersMap.get(g.clientId);
      return {
        userId: g.clientId,
        fullName: u?.fullName ?? "Cliente",
        avatarBase64: u?.avatarBase64 ?? null,
        cuts: g._count.id,
      };
    });

    // Format recent cuts
    const recentCuts: RecentCutItem[] = recentCutsRaw.map((cut) => {
      let estado: RecentCutStatus;
      let amount = 0;

      if (cut.type === "REWARD_FREE" || cut.type === "BIRTHDAY_FREE") {
        estado = "FREE";
        amount = 0;
      } else if (cut.type === "NORMAL") {
        estado = "PAID";
        amount = defaultCutPrice;
      } else {
        // FIADO
        amount = cut.amountPaid ?? 0;
        estado = cut.isPaid ? "PAID" : "PENDING";
      }

      return {
        id: cut.id,
        client: {
          id: cut.client.id,
          fullName: cut.client.fullName,
          username: cut.client.username,
        },
        date: cut.date.toISOString(),
        amount: Math.round(amount * 100) / 100,
        estado,
      };
    });

    const responseData: AdminStatsResponse = {
      kpis: {
        activeClients: {
          value: activeClientsCount,
          changePercentage: calculatePercentageChange(
            activeClientsCount,
            activeClientsPrevMonth,
          ),
        },
        cutsThisMonth: {
          value: cutsCurrentMonth,
          changePercentage: calculatePercentageChange(cutsCurrentMonth, cutsPrevMonth),
        },
        revenueThisMonth: {
          value: Math.round(revenueCurrentMonth * 100) / 100,
          changePercentage: calculatePercentageChange(revenueCurrentMonth, revenuePrevMonth),
        },
        freeCutsRedeemed: {
          value: freeCutsCurrentMonth,
          changePercentage: calculatePercentageChange(
            freeCutsCurrentMonth,
            freeCutsPrevMonth,
          ),
        },
      },
      cutsByMonth,
      revenueByMonth,
      paidVsPending,
      topClients,
      recentCuts,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return handleApiError(error);
  }
}
