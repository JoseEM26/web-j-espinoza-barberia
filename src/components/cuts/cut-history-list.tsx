"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Pencil, Scissors, Trash2, Wallet } from "lucide-react";
import type { CutRecord } from "@/lib/types";
import { CUT_TYPE_BADGE_VARIANT, CUT_TYPE_LABELS } from "@/lib/cut-labels";
import { useCutPrice } from "@/lib/use-cut-price";
import { api, ApiClientError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentAmountPicker } from "@/components/admin/payment-amount-picker";
import { EditCutDialog } from "@/components/admin/edit-cut-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function paymentSummary(cut: CutRecord, cutPrice: number | null) {
  const paid = cut.amountPaid ?? 0;
  if (cut.isPaid) return `Pagado (S/ ${paid.toFixed(2)})`;
  if (cutPrice != null) {
    const owed = Math.max(cutPrice - paid, 0);
    return paid > 0
      ? `Pagó S/ ${paid.toFixed(2)} de S/ ${cutPrice.toFixed(2)} · debe S/ ${owed.toFixed(2)}`
      : `Debe S/ ${cutPrice.toFixed(2)} (fiado completo)`;
  }
  return `Pagó S/ ${paid.toFixed(2)}`;
}

export function CutHistoryList({
  cuts,
  showClient = false,
  emptyMessage = "Todavía no hay cortes registrados.",
  onDelete,
  canEditPayment = false,
  onChanged,
}: {
  cuts: CutRecord[];
  showClient?: boolean;
  emptyMessage?: string;
  onDelete?: (id: string) => void;
  canEditPayment?: boolean;
  onChanged?: () => void;
}) {
  const [paymentCut, setPaymentCut] = useState<CutRecord | null>(null);
  const [editingCut, setEditingCut] = useState<CutRecord | null>(null);
  const cutPrice = useCutPrice();

  if (cuts.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-white shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted">
          <Scissors className="size-8 text-sand" />
          <p className="text-xs sm:text-sm font-medium">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {cuts.map((cut) => (
          <Card
            key={cut.id}
            className="rounded-2xl border border-border bg-white shadow-2xs transition-shadow hover:shadow-xs"
          >
            <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
              <div className="size-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary shrink-0">
                <Scissors className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      cut.type === "FIADO" && cut.isPaid
                        ? "success"
                        : CUT_TYPE_BADGE_VARIANT[cut.type]
                    }
                  >
                    {CUT_TYPE_LABELS[cut.type]}
                  </Badge>
                  <span className="text-xs text-muted">
                    {format(new Date(cut.date), "d 'de' MMMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>

                {showClient && cut.client && (
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {cut.client.fullName}{" "}
                    <span className="font-normal text-muted">@{cut.client.username}</span>
                  </p>
                )}

                {cut.type === "FIADO" && (
                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border",
                        cut.isPaid
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800",
                      )}
                    >
                      <Wallet className="size-3" />
                      {paymentSummary(cut, cutPrice)}
                    </span>
                  </div>
                )}

                {cut.note && (
                  <p className="mt-1 truncate text-xs text-foreground/80">{cut.note}</p>
                )}

                {cut.admin && (
                  <p className="mt-0.5 text-[11px] text-muted">
                    Registrado por {cut.admin.fullName}
                  </p>
                )}
              </div>

              {canEditPayment && cut.type === "FIADO" && !cut.isPaid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setPaymentCut(cut)}
                >
                  <Wallet className="size-3.5" />
                  <span className="hidden sm:inline">Registrar pago</span>
                </Button>
              )}

              {canEditPayment && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted hover:text-primary"
                  onClick={() => setEditingCut(cut)}
                  title="Editar corte"
                >
                  <Pencil className="size-4" />
                </Button>
              )}

              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted hover:text-red-600"
                  onClick={() => onDelete(cut.id)}
                  title="Eliminar corte"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <UpdatePaymentDialog
        cut={paymentCut}
        cutPrice={cutPrice}
        onClose={() => setPaymentCut(null)}
        onSaved={() => {
          setPaymentCut(null);
          onChanged?.();
        }}
      />

      <EditCutDialog
        cut={editingCut}
        onClose={() => setEditingCut(null)}
        onSaved={() => {
          setEditingCut(null);
          onChanged?.();
        }}
      />
    </>
  );
}

function UpdatePaymentDialog({
  cut,
  cutPrice,
  onClose,
  onSaved,
}: {
  cut: CutRecord | null;
  cutPrice: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [openForId, setOpenForId] = useState<string | null>(null);
  if (cut && cut.id !== openForId) {
    setOpenForId(cut.id);
    setAmount(cut.amountPaid ?? 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cut) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/cuts/${cut.id}/payment`, { amountPaid: amount });
      toast.success("Pago registrado.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "No se pudo registrar el pago.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!cut} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Registrar pago{cut?.client ? ` de ${cut.client.fullName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PaymentAmountPicker
            amount={amount}
            onChange={setAmount}
            cutPrice={cutPrice}
          />
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
