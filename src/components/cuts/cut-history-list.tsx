"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Scissors, Trash2, Wallet } from "lucide-react";
import type { CutRecord } from "@/lib/types";
import { CUT_TYPE_BADGE_VARIANT, CUT_TYPE_LABELS } from "@/lib/cut-labels";
import { useCutPrice } from "@/lib/use-cut-price";
import { api, ApiClientError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentAmountPicker } from "@/components/admin/payment-amount-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const cutPrice = useCutPrice();

  if (cuts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-foreground/40">
          <Scissors className="h-8 w-8" />
          <p className="text-sm">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {cuts.map((cut) => (
          <Card key={cut.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      cut.type === "FIADO" && cut.isPaid ? "success" : CUT_TYPE_BADGE_VARIANT[cut.type]
                    }
                  >
                    {CUT_TYPE_LABELS[cut.type]}
                  </Badge>
                  <span className="text-xs text-foreground/40">
                    {format(new Date(cut.date), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                  </span>
                </div>
                {showClient && cut.client && (
                  <p className="mt-1 truncate text-sm font-medium text-gold-100">
                    {cut.client.fullName}{" "}
                    <span className="text-foreground/40">@{cut.client.username}</span>
                  </p>
                )}
                {cut.type === "FIADO" && (
                  <p
                    className={
                      cut.isPaid
                        ? "mt-1 text-sm text-emerald-300/80"
                        : "mt-1 text-sm text-amber-300/80"
                    }
                  >
                    {paymentSummary(cut, cutPrice)}
                  </p>
                )}
                {cut.note && (
                  <p className="mt-1 truncate text-sm text-foreground/60">{cut.note}</p>
                )}
                {cut.admin && (
                  <p className="mt-1 text-xs text-foreground/30">
                    Registrado por {cut.admin.fullName}
                  </p>
                )}
              </div>

              {canEditPayment && cut.type === "FIADO" && !cut.isPaid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setPaymentCut(cut)}
                >
                  <Wallet /> Registrar pago
                </Button>
              )}

              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-foreground/30 hover:text-red-400"
                  onClick={() => onDelete(cut.id)}
                  title="Eliminar corte"
                >
                  <Trash2 className="h-4 w-4" />
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

  // Reinicia el monto cada vez que se abre para un corte distinto.
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
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo registrar el pago.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!cut} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago{cut?.client ? ` de ${cut.client.fullName}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PaymentAmountPicker amount={amount} onChange={setAmount} cutPrice={cutPrice} />
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
