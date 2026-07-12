import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { updateCutSchema } from "@/lib/validators/cut";
import { getSettings } from "@/lib/settings";
import { ApiError, handleApiError } from "@/lib/api-error";

// Permite al admin editar un corte ya registrado: tipo, nota y (si el tipo
// resultante es FIADO) el monto pagado. Si deja de ser FIADO, se limpia el
// estado de pago porque ya no aplica.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateCutSchema.parse(body);

    const existing = await prisma.cut.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Corte no encontrado.");

    const type = data.type ?? existing.type;
    const note = data.note !== undefined ? data.note : existing.note;

    let amountPaid: number | null = null;
    let isPaid = false;
    if (type === "FIADO") {
      const settings = await getSettings();
      amountPaid = data.amountPaid ?? existing.amountPaid ?? 0;
      if (amountPaid > settings.cutPrice) {
        throw ApiError.badRequest(
          `El monto pagado no puede superar el precio del corte (S/ ${settings.cutPrice}).`,
        );
      }
      isPaid = amountPaid >= settings.cutPrice;
    }

    const updated = await prisma.cut.update({
      where: { id },
      data: { type, note, amountPaid, isPaid },
      include: { admin: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json({ cut: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

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
