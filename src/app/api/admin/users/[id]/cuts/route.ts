import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createCutSchema } from "@/lib/validators/cut";
import { enforcePhotoRetentionLimit, suggestCutType } from "@/lib/loyalty";
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
// por cumpleaños o gratis por lealtad) se sugiere automáticamente según la
// tarjeta del cliente, pero el admin puede sobreescribirlo explícitamente.
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

    const cut = await prisma.cut.create({
      data: {
        clientId: client.id,
        adminId: admin.id,
        type,
        note: data.note,
        photoBase64: data.photoBase64 ?? undefined,
      },
      include: { admin: { select: { username: true, fullName: true } } },
    });

    if (data.photoBase64) {
      await enforcePhotoRetentionLimit();
    }

    return NextResponse.json({ cut }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
