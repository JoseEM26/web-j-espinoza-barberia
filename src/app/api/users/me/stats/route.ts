import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { getSettings } from "@/lib/settings";
import { computeCardStatus } from "@/lib/loyalty";
import { getMonthBuckets, formatMonthKey } from "@/lib/stats-utils";
import type {
  UserStatsResponse,
  CutsByMonthItem,
  SpendCumulativeByMonthItem,
} from "@/lib/stats-types";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const now = new Date();

    const monthBuckets = getMonthBuckets(6, now);
    const sixMonthsAgoStart = monthBuckets[0].startUTC;

    const [settings, cardStatus, lastCut, cutsInSixMonths, allPaidCuts] = await Promise.all([
      getSettings(),
      computeCardStatus(user.id, user.birthDate),
      prisma.cut.findFirst({
        where: { clientId: user.id },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
      // Query bounded by last 6 months for cutsByMonth and spend breakdown
      prisma.cut.findMany({
        where: {
          clientId: user.id,
          date: { gte: sixMonthsAgoStart },
        },
        select: {
          type: true,
          amountPaid: true,
          isPaid: true,
          date: true,
        },
      }),
      // For all-time totalSpent
      prisma.cut.findMany({
        where: {
          clientId: user.id,
          OR: [
            { type: "NORMAL" },
            { type: "FIADO", amountPaid: { gt: 0 } },
          ],
        },
        select: {
          type: true,
          amountPaid: true,
        },
      }),
    ]);

    // Calculate total spent all-time
    const defaultCutPrice = settings.cutPrice;
    let totalSpent = 0;
    for (const cut of allPaidCuts) {
      if (cut.type === "NORMAL") {
        totalSpent += defaultCutPrice;
      } else if (cut.type === "FIADO") {
        totalSpent += cut.amountPaid ?? 0;
      }
    }

    // Days since last cut
    let lastCutDaysAgo: number | null = null;
    if (lastCut) {
      const diffMs = now.getTime() - new Date(lastCut.date).getTime();
      lastCutDaysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Completed loyalty cycles count
    const completedCycles = cardStatus.cycles.filter((c) => c.completed).length;

    // Monthly aggregates for the last 6 months
    const cutsCountByMonth: Record<string, number> = {};
    const spendByMonth: Record<string, number> = {};

    for (const b of monthBuckets) {
      cutsCountByMonth[b.month] = 0;
      spendByMonth[b.month] = 0;
    }

    for (const cut of cutsInSixMonths) {
      const mKey = formatMonthKey(cut.date);
      if (cutsCountByMonth[mKey] !== undefined) {
        cutsCountByMonth[mKey] += 1;
      }

      let paidAmount = 0;
      if (cut.type === "NORMAL") {
        paidAmount = defaultCutPrice;
      } else if (cut.type === "FIADO") {
        paidAmount = cut.amountPaid ?? 0;
      }

      if (paidAmount > 0 && spendByMonth[mKey] !== undefined) {
        spendByMonth[mKey] += paidAmount;
      }
    }

    const cutsByMonth: CutsByMonthItem[] = monthBuckets.map((b) => ({
      month: b.month,
      label: b.label,
      cuts: cutsCountByMonth[b.month] ?? 0,
    }));

    let runningSpend = 0;
    const spendCumulativeByMonth: SpendCumulativeByMonthItem[] = monthBuckets.map((b) => {
      const monthlySpend = spendByMonth[b.month] ?? 0;
      runningSpend += monthlySpend;
      return {
        month: b.month,
        label: b.label,
        spend: Math.round(monthlySpend * 100) / 100,
        cumulative: Math.round(runningSpend * 100) / 100,
      };
    });

    const responseData: UserStatsResponse = {
      cutsByMonth,
      spendCumulativeByMonth,
      totals: {
        totalCuts: cardStatus.totalCuts,
        completedCycles,
        lastCutDaysAgo,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return handleApiError(error);
  }
}
