import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { updateCutPaymentSchema } from "@/lib/validators/cut";
import { getSettings } from "@/lib/settings";
import { ApiError, handleApiError } from "@/lib/api-error";

// Permite al admin registrar/actualizar cuánto ha pagado un corte fiado
// (para marcarlo como pagado del todo, o solo actualizar un abono parcial).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { amountPaid } = updateCutPaymentSchema.parse(body);

    const existing = await prisma.cut.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Corte no encontrado.");
    if (existing.type !== "FIADO") {
      throw ApiError.badRequest("Solo los cortes fiado tienen un pago que registrar.");
    }

    const settings = await getSettings();
    if (amountPaid > settings.cutPrice) {
      throw ApiError.badRequest(
        `El monto pagado no puede superar el precio del corte (S/ ${settings.cutPrice}).`,
      );
    }

    const updated = await prisma.cut.update({
      where: { id },
      data: { amountPaid, isPaid: amountPaid >= settings.cutPrice },
      include: { admin: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json({ cut: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
