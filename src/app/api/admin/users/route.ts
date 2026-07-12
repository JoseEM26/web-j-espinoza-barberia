import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { listUsersQuerySchema } from "@/lib/validators/user";
import { handleApiError } from "@/lib/api-error";
import type { Prisma } from "@/generated/prisma/client";

// Listado/búsqueda de usuarios para el panel de administración.
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { search, status, page, pageSize } = listUsersQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.UserWhereInput = {
      role: "CLIENT",
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "blocked" ? { isActive: false } : {}),
      ...(search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          username: true,
          fullName: true,
          birthDate: true,
          avatarBase64: true,
          role: true,
          isActive: true,
          blockedReason: true,
          blockedAt: true,
          createdAt: true,
          _count: { select: { cuts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
