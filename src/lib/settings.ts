import { prisma } from "@/lib/prisma";

const SETTINGS_ID = 1;

/** Devuelve la configuración del negocio, creándola con valores por defecto si no existe. */
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function updateSettings(data: {
  businessName?: string;
  cutsRequiredForReward?: number;
  birthdayDiscountLabel?: string;
  rewardDiscountLabel?: string;
  maxStoredPhotos?: number;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
}) {
  await getSettings();
  return prisma.settings.update({
    where: { id: SETTINGS_ID },
    data,
  });
}
