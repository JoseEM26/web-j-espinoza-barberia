import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { adminResetPasswordSchema } from "@/lib/validators/user";
import { hashPassword } from "@/lib/auth/password";
import { ApiError, handleApiError } from "@/lib/api-error";

// El administrador puede restablecer la contraseña de cualquier usuario.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { newPassword } = adminResetPasswordSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Usuario no encontrado.");

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
