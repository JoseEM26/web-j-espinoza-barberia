import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

// Historial propio de cortes.
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const cuts = await prisma.cut.findMany({
      where: { clientId: user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        type: true,
        note: true,
        amountPaid: true,
        isPaid: true,
        date: true,
        admin: { select: { username: true, fullName: true } },
      },
    });
    return NextResponse.json({ cuts });
  } catch (error) {
    return handleApiError(error);
  }
}
