import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings, updateSettings } from "@/lib/settings";
import {
  normalizeInstagramUrl,
  normalizeWhatsappNumber,
  updateSettingsSchema,
} from "@/lib/validators/settings";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

// El admin configura cada cuántos cortes se regala uno, el precio del corte
// y los textos editables del negocio.
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const settings = await updateSettings({
      ...data,
      instagramUrl: normalizeInstagramUrl(data.instagramUrl),
      whatsappNumber: normalizeWhatsappNumber(data.whatsappNumber),
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
