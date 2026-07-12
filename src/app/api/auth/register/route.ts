import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { ApiError, handleApiError } from "@/lib/api-error";

// Registro público: cualquiera puede crear su usuario cliente.
// Sin correo — solo usuario, contraseña, nombre y fecha de nacimiento.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw ApiError.conflict("Ese nombre de usuario ya está en uso.");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        fullName: data.fullName,
        birthDate: data.birthDate,
        role: "CLIENT",
      },
    });

    const token = signAuthToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          birthDate: user.birthDate,
          role: user.role,
        },
      },
      { status: 201 },
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
