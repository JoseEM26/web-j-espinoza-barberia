import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "./jwt";
import { AUTH_COOKIE_NAME } from "./constants";
import { ApiError } from "@/lib/api-error";
import type { Role } from "@/generated/prisma/client";

export { AUTH_COOKIE_NAME };
const COOKIE_MAX_AGE = Number(process.env.JWT_COOKIE_MAX_AGE_SECONDS ?? 604800);

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  birthDate: true,
  role: true,
  isActive: true,
  blockedReason: true,
} as const;

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  birthDate: Date;
  role: Role;
  isActive: boolean;
  blockedReason: string | null;
};

export async function getCurrentUser(
  request: NextRequest,
): Promise<AuthUser | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: SAFE_USER_SELECT,
  });

  return user;
}

/** Lanza 401 si no hay sesión válida, o 403 si el usuario está bloqueado. */
export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  if (!user) throw ApiError.unauthorized();
  if (!user.isActive) {
    throw ApiError.forbidden(
      user.blockedReason
        ? `Tu cuenta fue bloqueada. Motivo: ${user.blockedReason}`
        : "Tu cuenta fue bloqueada.",
    );
  }
  return user;
}

/** Igual que requireUser, pero además exige rol ADMIN. */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    throw ApiError.forbidden("Requiere permisos de administrador.");
  }
  return user;
}
