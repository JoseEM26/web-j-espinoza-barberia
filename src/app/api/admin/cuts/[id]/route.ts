import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ApiError, handleApiError } from "@/lib/api-error";

// Permite al admin corregir una firma/corte mal registrado.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const existing = await prisma.cut.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Corte no encontrado.");

    await prisma.cut.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
