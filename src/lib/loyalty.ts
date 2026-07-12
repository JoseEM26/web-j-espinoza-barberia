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

export interface LoyaltyCycle {
  cycleNumber: number;
  stamps: number;
  stampsRequired: number;
  completed: boolean;
  completedAt: string | null;
}

export interface CycleStamp {
  /** Un sello de un corte fiado todavía no pagado — se ve distinto (no es un check normal). */
  isFiadoUnpaid: boolean;
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
  /** Historial completo de ciclos (sin límite): cada uno se cierra al entregar
   * un corte gratis por lealtad y el conteo arranca de cero para el siguiente. */
  cycles: LoyaltyCycle[];
  /** Los sellos del ciclo actual (en progreso), en orden, para pintar cada
   * círculo según su estado real (normal vs. fiado sin pagar). */
  currentCycleStamps: CycleStamp[];
}

export async function computeCardStatus(
  clientId: string,
  birthDate: Date,
): Promise<CardStatus> {
  const settings = await getSettings();
  const cuts = await prisma.cut.findMany({
    where: { clientId },
    orderBy: { date: "asc" },
    select: { type: true, date: true, isPaid: true },
  });

  const required = settings.cutsRequiredForReward;

  // Agrupa los cortes en ciclos: un corte "normal"/"fiado" suma un sello; un
  // corte gratis por lealtad cierra el ciclo actual y arranca uno nuevo. Los
  // cortes de cumpleaños no afectan el conteo (son un beneficio aparte). No
  // hay límite de cuántos ciclos se acumulen — se derivan de todo el
  // historial del cliente.
  const cycles: LoyaltyCycle[] = [];
  let stampsInCycle: CycleStamp[] = [];
  for (const cut of cuts) {
    if (cut.type === "NORMAL" || cut.type === "FIADO") {
      stampsInCycle.push({ isFiadoUnpaid: cut.type === "FIADO" && !cut.isPaid });
    } else if (cut.type === "REWARD_FREE") {
      cycles.push({
        cycleNumber: cycles.length + 1,
        stamps: stampsInCycle.length,
        stampsRequired: required,
        completed: true,
        completedAt: cut.date.toISOString(),
      });
      stampsInCycle = [];
    }
  }
  // El ciclo actual, en progreso (todavía sin cerrar).
  cycles.push({
    cycleNumber: cycles.length + 1,
    stamps: stampsInCycle.length,
    stampsRequired: required,
    completed: false,
    completedAt: null,
  });

  const stampsSinceReward = cycles[cycles.length - 1].stamps;

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
    cycles,
    currentCycleStamps: stampsInCycle,
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
