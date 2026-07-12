import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { handleApiError } from "@/lib/api-error";

// Configuración pública (sin requerir sesión): nombre del negocio, mensajes
// de la tarjeta y redes sociales, para mostrarlas incluso en login/registro.
export async function GET() {
  try {
    const settings = await getSettings();

    return NextResponse.json({
      settings: {
        businessName: settings.businessName,
        cutsRequiredForReward: settings.cutsRequiredForReward,
        birthdayDiscountLabel: settings.birthdayDiscountLabel,
        rewardDiscountLabel: settings.rewardDiscountLabel,
        instagramUrl: settings.instagramUrl,
        whatsappNumber: settings.whatsappNumber,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
