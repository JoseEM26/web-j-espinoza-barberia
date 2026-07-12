"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRequireRole } from "@/lib/use-require-role";
import { api } from "@/lib/api-client";
import type { CardStatus, CutRecord } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { LoyaltyCard } from "@/components/dashboard/loyalty-card";
import { CutHistoryList } from "@/components/cuts/cut-history-list";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialFooter } from "@/components/layout/social-footer";

export default function DashboardPage() {
  const { user, authorized } = useRequireRole("CLIENT");
  const [card, setCard] = useState<CardStatus | null>(null);
  const [cuts, setCuts] = useState<CutRecord[] | null>(null);

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const [cardRes, cutsRes] = await Promise.all([
          api.get<{ card: CardStatus }>("/users/me/card"),
          api.get<{ cuts: CutRecord[] }>("/users/me/cuts"),
        ]);
        setCard(cardRes.card);
        setCuts(cutsRes.cuts);
      } catch {
        toast.error("No se pudo cargar tu información.");
      }
    })();
  }, [authorized]);

  if (!authorized || !user) return <SplashScreen />;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="font-elegant text-2xl italic text-gold-200">
            Hola, {user.fullName.split(" ")[0]}
          </p>
          <p className="text-sm text-foreground/50">Este es el estado de tu tarjeta.</p>
        </div>

        {card ? <LoyaltyCard card={card} /> : <Skeleton className="h-56 w-full" />}

        <div>
          <h2 className="mb-3 font-display text-lg text-gold-100">Historial de cortes</h2>
          {cuts ? (
            <CutHistoryList cuts={cuts} />
          ) : (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
        </div>

        <SocialFooter />
      </main>
    </div>
  );
}
