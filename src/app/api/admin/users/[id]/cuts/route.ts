import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createCutSchema } from "@/lib/validators/cut";
import { suggestCutType } from "@/lib/loyalty";
import { getSettings } from "@/lib/settings";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const cuts = await prisma.cut.findMany({
      where: { clientId: id },
      orderBy: { date: "desc" },
      include: { admin: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json({ cuts });
  } catch (error) {
    return handleApiError(error);
  }
}

// El admin registra una "firma"/check por cada corte. El tipo (normal, gratis
// por cumpleaños, gratis por lealtad o fiado) se sugiere automáticamente
// según la tarjeta del cliente, pero el admin puede sobreescribirlo.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    const { id: clientId } = await params;
    const body = await request.json();
    const data = createCutSchema.parse(body);

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) throw ApiError.notFound("Cliente no encontrado.");
    if (client.role !== "CLIENT") {
      throw ApiError.badRequest("Solo se pueden registrar cortes para clientes.");
    }

    const type = data.type ?? (await suggestCutType(client.id, client.birthDate));

    let amountPaid: number | undefined;
    let isPaid = false;
    if (type === "FIADO") {
      const settings = await getSettings();
      amountPaid = data.amountPaid ?? 0;
      if (amountPaid > settings.cutPrice) {
        throw ApiError.badRequest(
          `El monto pagado no puede superar el precio del corte (S/ ${settings.cutPrice}).`,
        );
      }
      isPaid = amountPaid >= settings.cutPrice;
    }

    const cut = await prisma.cut.create({
      data: {
        clientId: client.id,
        adminId: admin.id,
        type,
        note: data.note,
        amountPaid,
        isPaid,
      },
      include: { admin: { select: { username: true, fullName: true } } },
    });

    return NextResponse.json({ cut }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
