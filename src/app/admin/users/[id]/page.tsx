"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import { formatBirthDate } from "@/lib/format-birthdate";
import { api, ApiClientError } from "@/lib/api-client";
import type { AdminUserDetail, CardStatus, CutRecord } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { LoyaltyCard } from "@/components/dashboard/loyalty-card";
import { CutHistoryList } from "@/components/cuts/cut-history-list";
import { AddCutDialog } from "@/components/admin/add-cut-dialog";
import { BlockUserDialog } from "@/components/admin/block-user-dialog";
import { UnblockUserButton } from "@/components/admin/unblock-user-button";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUserDetailPage() {
  const { user, authorized } = useRequireRole("ADMIN");
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [card, setCard] = useState<CardStatus | null>(null);
  const [cuts, setCuts] = useState<CutRecord[] | null>(null);

  const load = useCallback(async () => {
    try {
      const [detailRes, cardRes, cutsRes] = await Promise.all([
        api.get<{ user: AdminUserDetail }>(`/admin/users/${clientId}`),
        api.get<{ card: CardStatus }>(`/admin/users/${clientId}/card`),
        api.get<{ cuts: CutRecord[] }>(`/admin/users/${clientId}/cuts`),
      ]);
      setDetail(detailRes.user);
      setCard(cardRes.card);
      setCuts(cutsRes.cuts);
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo cargar el cliente.");
    }
  }, [clientId]);

  useEffect(() => {
    if (authorized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial del cliente
      load();
    }
  }, [authorized, load]);

  async function handleDeleteCut(cutId: string) {
    if (!confirm("¿Eliminar este corte del historial?")) return;
    try {
      await api.delete(`/admin/cuts/${cutId}`);
      toast.success("Corte eliminado.");
      load();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo eliminar.");
    }
  }

  if (!authorized || !user) return <SplashScreen />;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm text-foreground/50 hover:text-gold-200"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a clientes
        </Link>

        {!detail ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={detail.avatarBase64 ?? undefined} alt={detail.fullName} />
                      <AvatarFallback className="text-lg">
                        {detail.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl text-foreground">{detail.fullName}</p>
                        <Badge variant={detail.isActive ? "success" : "destructive"}>
                          {detail.isActive ? "Activo" : "Bloqueado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/40">@{detail.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <EditUserDialog user={detail} onSaved={load} />
                    <ResetPasswordDialog userId={detail.id} userName={detail.fullName} />
                    {detail.isActive ? (
                      <BlockUserDialog
                        userId={detail.id}
                        userName={detail.fullName}
                        onBlocked={load}
                      />
                    ) : (
                      <UnblockUserButton userId={detail.id} onUnblocked={load} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-md border border-surface-border bg-surface-2/50 px-3 py-2">
                    <p className="text-xs text-foreground/40">Fecha de nacimiento</p>
                    <p className="text-foreground/90">{formatBirthDate(detail.birthDate)}</p>
                  </div>
                  <div className="rounded-md border border-surface-border bg-surface-2/50 px-3 py-2">
                    <p className="text-xs text-foreground/40">Cliente desde</p>
                    <p className="text-foreground/90">
                      {format(new Date(detail.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                {!detail.isActive && detail.blockedReason && (
                  <div className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                    Bloqueado{detail.blockedBy && ` por ${detail.blockedBy.fullName}`}. Motivo:{" "}
                    {detail.blockedReason}
                  </div>
                )}
              </CardContent>
            </Card>

            {card && <LoyaltyCard card={card} />}

            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-gold-100">Historial de cortes</h2>
              <AddCutDialog clientId={detail.id} clientName={detail.fullName} onAdded={load} />
            </div>

            {cuts ? (
              <CutHistoryList cuts={cuts} onDelete={handleDeleteCut} />
            ) : (
              <Skeleton className="h-24 w-full" />
            )}
          </>
        )}
      </main>
    </div>
  );
}
