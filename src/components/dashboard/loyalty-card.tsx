import { Check, Gift, PartyPopper, Scissors } from "lucide-react";
import type { CardStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoyaltyCard({ card }: { card: CardStatus }) {
  const stamps = Array.from({ length: card.cutsRequiredForReward }, (_, i) => i < card.stampsSinceReward);

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
      <CardContent className="relative flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-300/70">
              Tarjeta de fidelidad
            </p>
            <p className="font-display text-2xl text-foreground">
              {card.stampsSinceReward} / {card.cutsRequiredForReward} cortes
            </p>
          </div>
          <Scissors className="h-8 w-8 text-gold-400/60" />
        </div>

        <div className="flex flex-wrap gap-3">
          {stamps.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                filled
                  ? "border-gold-400 bg-gradient-to-b from-gold-300 to-gold-500 text-[#1a1206]"
                  : "border-dashed border-surface-border text-foreground/20",
              )}
            >
              {filled ? <Check className="h-5 w-5" /> : <span className="text-xs">{i + 1}</span>}
            </div>
          ))}
        </div>

        {card.rewardReady ? (
          <div className="flex items-center gap-2 rounded-md border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-100">
            <Gift className="h-5 w-5 shrink-0 text-gold-300" />
            {card.rewardDiscountLabel}
          </div>
        ) : (
          <p className="text-sm text-foreground/50">
            Te faltan <span className="text-gold-300 font-medium">{card.remainingForReward}</span>{" "}
            corte{card.remainingForReward === 1 ? "" : "s"} para tu próximo corte gratis.
          </p>
        )}

        {card.isBirthdayToday && (
          <div className="flex items-center gap-2 rounded-md border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-100">
            <PartyPopper className="h-5 w-5 shrink-0 text-gold-300" />
            {card.birthdayDiscountLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
