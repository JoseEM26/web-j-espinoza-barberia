import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { isBirthdayToday } from "@/lib/loyalty";
import { getSettings } from "@/lib/settings";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const [settings, avatar] = await Promise.all([
      getSettings(),
      prisma.user.findUnique({ where: { id: user.id }, select: { avatarBase64: true } }),
    ]);
    const birthdayToday = isBirthdayToday(user.birthDate);

    return NextResponse.json({
      user: { ...user, avatarBase64: avatar?.avatarBase64 ?? null },
      isBirthdayToday: birthdayToday,
      birthdayMessage: birthdayToday ? settings.birthdayDiscountLabel : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
