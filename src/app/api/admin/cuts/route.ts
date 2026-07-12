import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
  clientId: z.string().optional(),
  onlyWithPhoto: z.coerce.boolean().optional().default(false),
});

// Vista global de todos los cortes registrados (historial completo de la barbería).
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { page, pageSize, clientId, onlyWithPhoto } = querySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where = {
      ...(clientId ? { clientId } : {}),
      ...(onlyWithPhoto ? { photoBase64: { not: null } } : {}),
    };

    const [cuts, total] = await Promise.all([
      prisma.cut.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          client: { select: { id: true, username: true, fullName: true } },
          admin: { select: { id: true, username: true, fullName: true } },
        },
      }),
      prisma.cut.count({ where }),
    ]);

    return NextResponse.json({
      cuts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
