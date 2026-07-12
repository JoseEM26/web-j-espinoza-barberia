import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { adminUpdateUserSchema } from "@/lib/validators/user";
import { ApiError, handleApiError } from "@/lib/api-error";

const DETAIL_SELECT = {
  id: true,
  username: true,
  fullName: true,
  birthDate: true,
  avatarBase64: true,
  role: true,
  isActive: true,
  blockedReason: true,
  blockedAt: true,
  blockedBy: { select: { id: true, username: true, fullName: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id }, select: DETAIL_SELECT });
    if (!user) throw ApiError.notFound("Usuario no encontrado.");

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// El administrador puede editar cualquier dato del perfil de un cliente.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const data = adminUpdateUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Usuario no encontrado.");

    if (data.username && data.username !== existing.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (usernameTaken) throw ApiError.conflict("Ese nombre de usuario ya está en uso.");
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: DETAIL_SELECT,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
