import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { computeCardStatus } from "@/lib/loyalty";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const card = await computeCardStatus(user.id, user.birthDate);
    return NextResponse.json({ card });
  } catch (error) {
    return handleApiError(error);
  }
}
