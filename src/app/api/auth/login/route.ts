import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { ApiError, handleApiError } from "@/lib/api-error";
import { isBirthdayToday } from "@/lib/loyalty";
import { getSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { username: data.username.trim().toLowerCase() },
    });

    // Mensaje genérico para no revelar si el usuario existe o no.
    const invalidCredentials = () =>
      ApiError.unauthorized("Usuario o contraseña incorrectos.");

    if (!user) throw invalidCredentials();

    const passwordOk = await verifyPassword(data.password, user.passwordHash);
    if (!passwordOk) throw invalidCredentials();

    if (!user.isActive) {
      throw ApiError.forbidden(
        user.blockedReason
          ? `Tu cuenta fue bloqueada. Motivo: ${user.blockedReason}`
          : "Tu cuenta fue bloqueada. Contacta a la barbería.",
      );
    }

    const token = signAuthToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const settings = await getSettings();
    const birthdayToday = isBirthdayToday(user.birthDate);

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        birthDate: user.birthDate,
        avatarBase64: user.avatarBase64,
        role: user.role,
      },
      isBirthdayToday: birthdayToday,
      birthdayMessage: birthdayToday ? settings.birthdayDiscountLabel : null,
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
