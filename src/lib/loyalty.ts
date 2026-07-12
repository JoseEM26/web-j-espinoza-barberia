import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import type { CutType } from "@/generated/prisma/client";

// La fecha de nacimiento se guarda como medianoche UTC del día calendario que
// el usuario ingresó, así que sus componentes UTC representan el día "real".
// Para "hoy" en cambio hay que usar el día calendario de la zona horaria del
// negocio (el reloj del servidor corre en UTC y puede ya ser el día siguiente
// ahí mientras en la barbería todavía es el día del cumpleaños).
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "America/Lima";

function getLocalMonthDay(date: Date, timeZone: string): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { month, day };
}

/** Compara solo día y mes (en la zona horaria del negocio): el año no importa. */
export function isBirthdayToday(birthDate: Date, now: Date = new Date()): boolean {
  const today = getLocalMonthDay(now, BUSINESS_TIMEZONE);
  return (
    birthDate.getUTCMonth() + 1 === today.month &&
    birthDate.getUTCDate() === today.day
  );
}

export interface CardStatus {
  cutsRequiredForReward: number;
  stampsSinceReward: number;
  remainingForReward: number;
  rewardReady: boolean;
  totalCuts: number;
  totalRewardCutsGiven: number;
  totalBirthdayCutsGiven: number;
  totalFiadoCutsGiven: number;
  isBirthdayToday: boolean;
  birthdayDiscountLabel: string;
  rewardDiscountLabel: string;
}

export async function computeCardStatus(
  clientId: string,
  birthDate: Date,
): Promise<CardStatus> {
  const settings = await getSettings();
  const cuts = await prisma.cut.findMany({
    where: { clientId },
    orderBy: { date: "asc" },
    select: { type: true, date: true },
  });

  const lastReward = [...cuts].reverse().find((c) => c.type === "REWARD_FREE");
  const cutsSinceReward = lastReward
    ? cuts.filter((c) => c.date > lastReward.date)
    : cuts;

  // Un corte "fiado" (a crédito) sigue siendo un corte realizado — cuenta
  // igual que uno normal para el progreso de la tarjeta.
  const stampsSinceReward = cutsSinceReward.filter(
    (c) => c.type === "NORMAL" || c.type === "FIADO",
  ).length;
  const required = settings.cutsRequiredForReward;

  return {
    cutsRequiredForReward: required,
    stampsSinceReward,
    remainingForReward: Math.max(required - stampsSinceReward, 0),
    rewardReady: stampsSinceReward >= required,
    totalCuts: cuts.length,
    totalRewardCutsGiven: cuts.filter((c) => c.type === "REWARD_FREE").length,
    totalBirthdayCutsGiven: cuts.filter((c) => c.type === "BIRTHDAY_FREE").length,
    totalFiadoCutsGiven: cuts.filter((c) => c.type === "FIADO").length,
    isBirthdayToday: isBirthdayToday(birthDate),
    birthdayDiscountLabel: settings.birthdayDiscountLabel,
    rewardDiscountLabel: settings.rewardDiscountLabel,
  };
}

/**
 * Sugiere el tipo de corte según el estado de la tarjeta, para que el admin
 * lo vea preseleccionado (pero puede sobreescribirlo explícitamente).
 */
export async function suggestCutType(
  clientId: string,
  birthDate: Date,
): Promise<CutType> {
  const status = await computeCardStatus(clientId, birthDate);
  if (status.isBirthdayToday) return "BIRTHDAY_FREE";
  if (status.rewardReady) return "REWARD_FREE";
  return "NORMAL";
}

/**
 * Mantiene como máximo `maxStoredPhotos` fotos guardadas en la base de datos:
 * al superar el límite, borra (deja en null) la foto más antigua, sin borrar
 * el registro del corte ni su historial.
 */
export async function enforcePhotoRetentionLimit(): Promise<void> {
  const settings = await getSettings();
  const photosWithId = await prisma.cut.findMany({
    where: { photoBase64: { not: null } },
    orderBy: { date: "asc" },
    select: { id: true },
  });

  const excess = photosWithId.length - settings.maxStoredPhotos;
  if (excess <= 0) return;

  const idsToClear = photosWithId.slice(0, excess).map((c) => c.id);
  await prisma.cut.updateMany({
    where: { id: { in: idsToClear } },
    data: { photoBase64: null },
  });
}
