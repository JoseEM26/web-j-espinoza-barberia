import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { computeCardStatus } from "@/lib/loyalty";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const client = await prisma.user.findUnique({ where: { id } });
    if (!client) throw ApiError.notFound("Usuario no encontrado.");

    const card = await computeCardStatus(client.id, client.birthDate);
    return NextResponse.json({ card });
  } catch (error) {
    return handleApiError(error);
  }
}
