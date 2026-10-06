import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Gift, PartyPopper, Trophy, Wallet } from "lucide-react";
import type { CardStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export function LoyaltyCard({ card }: { card: CardStatus }) {
  const stamps = Array.from(
    { length: card.cutsRequiredForReward },
    (_, i) => i < card.stampsSinceReward,
  );
  const completedCycles = card.cycles.filter((c) => c.completed);

  // Circular progress calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius; // ~125.66
  const progressRatio =
    card.cutsRequiredForReward > 0
      ? Math.min(card.stampsSinceReward / card.cutsRequiredForReward, 1)
      : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm shadow-[#7A4A2B]/[0.04]">
      {/* Subtle decorative background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-sand/15 blur-3xl" />

      <CardContent className="relative flex flex-col gap-5 p-5 sm:p-6">
        {/* Header with Circular Progress Ring */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Club de Fidelidad {completedCycles.length > 0 && `· Ciclo ${card.cycles.length}`}
            </span>
            <h2 className="mt-0.5 font-display text-xl font-bold text-foreground">
              Pase de Fidelidad
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {card.rewardReady
                ? "¡Tienes 50% de descuento listo para canjear!"
                : `¡Te faltan ${card.remainingForReward} corte${
                    card.remainingForReward === 1 ? "" : "s"
                  } para tu 50% de descuento!`}
            </p>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative flex size-14 shrink-0 items-center justify-center">
            <svg className="size-14 -rotate-90 transform" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="transparent"
                stroke="var(--sand-light)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-sans text-xs font-extrabold leading-none text-primary">
                {card.stampsSinceReward}/{card.cutsRequiredForReward}
              </span>
              <span className="mt-0.5 text-[8px] font-medium leading-none text-muted">
                Sellos
              </span>
            </div>
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 my-1">
          {stamps.map((filled, i) => {
            const isFiadoUnpaid = filled && card.currentCycleStamps[i]?.isFiadoUnpaid;
            const isLastStamp = i === card.cutsRequiredForReward - 1;

            if (isFiadoUnpaid) {
              return (
                <div
                  key={i}
                  title="Corte fiado sin pagar"
                  className="aspect-square rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-800 flex flex-col items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-default"
                >
                  <Wallet className="size-4" />
                  <span className="text-[9px] font-semibold mt-0.5">#{i + 1}</span>
                </div>
              );
            }

            if (filled) {
              return (
                <div
                  key={i}
                  title={`Sello #${i + 1} completado`}
                  className="aspect-square rounded-xl bg-primary text-white border border-primary-hover flex flex-col items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-default"
                >
                  <Check className="size-4.5 stroke-[2.5]" />
                  <span className="text-[9px] font-semibold mt-0.5 opacity-90">#{i + 1}</span>
                </div>
              );
            }

            if (isLastStamp) {
              return (
                <div
                  key={i}
                  title="¡50% de descuento al completar!"
                  className="aspect-square rounded-xl bg-gradient-to-br from-surface-2 to-sand-light/60 border-2 border-dashed border-primary text-primary flex flex-col items-center justify-center shadow-2xs"
                >
                  <Gift className="size-4" />
                  <span className="text-[9px] font-extrabold uppercase tracking-tight mt-0.5">
                    50% DSCTO
                  </span>
                </div>
              );
            }

            return (
              <div
                key={i}
                title={`Sello #${i + 1} pendiente`}
                className="aspect-square rounded-xl bg-surface-2 border-2 border-dashed border-sand text-secondary flex flex-col items-center justify-center"
              >
                <span className="text-xs font-semibold">{i + 1}</span>
                <span className="text-[8px] text-muted">Pend.</span>
              </div>
            );
          })}
        </div>

        {/* Unpaid Fiado Explanation */}
        {card.currentCycleStamps.some((s) => s.isFiadoUnpaid) && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 px-3.5 py-2 text-xs text-amber-800">
            <Wallet className="size-3.5 shrink-0 text-amber-600" />
            <span>Los sellos ámbar corresponden a cortes fiado pendientes de pago.</span>
          </div>
        )}

        {/* Reward Status Banner */}
        {card.rewardReady ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary shadow-2xs">
            <Gift className="size-5 shrink-0 text-primary" />
            <span>{card.rewardDiscountLabel}</span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted">
            Te faltan <span className="font-semibold text-primary">{card.remainingForReward}</span>{" "}
            corte{card.remainingForReward === 1 ? "" : "s"} para tu próximo 50% de descuento.
          </p>
        )}

        {/* Birthday Discount Banner */}
        {card.isBirthdayToday && (
          <div className="flex items-center gap-2.5 rounded-xl border border-sand bg-sand-light/40 px-4 py-3 text-sm font-medium text-primary shadow-2xs">
            <PartyPopper className="size-5 shrink-0 text-primary" />
            <span>{card.birthdayDiscountLabel}</span>
          </div>
        )}

        {/* Completed Cycles History */}
        {completedCycles.length > 0 && (
          <div className="flex flex-col gap-2.5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Historial de ciclos completados
            </p>
            <div className="flex flex-col gap-1.5">
              {completedCycles.map((cycle) => (
                <div
                  key={cycle.cycleNumber}
                  className="flex items-center justify-between rounded-xl bg-surface-2 border border-border/80 px-3.5 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="size-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">
                      Ciclo {cycle.cycleNumber} · {cycle.stamps} corte
                      {cycle.stamps === 1 ? "" : "s"}
                    </span>
                  </div>
                  {cycle.completedAt && (
                    <span className="text-xs text-muted">
                      {format(new Date(cycle.completedAt), "d MMM yyyy", { locale: es })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
