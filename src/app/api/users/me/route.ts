import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateSelfSchema } from "@/lib/validators/user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ApiError, handleApiError } from "@/lib/api-error";

const SELF_SELECT = {
  id: true,
  username: true,
  fullName: true,
  birthDate: true,
  avatarBase64: true,
  role: true,
  isActive: true,
  blockedReason: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const full = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: SELF_SELECT,
    });
    return NextResponse.json({ user: full });
  } catch (error) {
    return handleApiError(error);
  }
}

// El usuario solo puede editar su nombre, foto de perfil y contraseña — nada más.
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const data = updateSelfSchema.parse(body);

    let newPasswordHash: string | undefined;
    if (data.newPassword) {
      const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      const currentOk = await verifyPassword(data.currentPassword!, dbUser.passwordHash);
      if (!currentOk) {
        throw ApiError.badRequest("La contraseña actual es incorrecta.");
      }
      newPasswordHash = await hashPassword(data.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName,
        avatarBase64: data.avatarBase64,
        passwordHash: newPasswordHash,
      },
      select: SELF_SELECT,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
