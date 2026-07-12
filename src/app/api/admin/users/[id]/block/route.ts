import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { blockUserSchema } from "@/lib/validators/user";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { reason } = blockUserSchema.parse(body);

    if (id === admin.id) {
      throw ApiError.badRequest("No puedes bloquear tu propia cuenta.");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Usuario no encontrado.");

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        blockedReason: reason,
        blockedAt: new Date(),
        blockedById: admin.id,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        isActive: true,
        blockedReason: true,
        blockedAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
