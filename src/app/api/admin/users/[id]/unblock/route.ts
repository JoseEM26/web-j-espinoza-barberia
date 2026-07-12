import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Usuario no encontrado.");

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        blockedReason: null,
        blockedAt: null,
        blockedById: null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        isActive: true,
        blockedReason: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
