"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { useCutPrice } from "@/lib/use-cut-price";
import type { CutRecord, CutType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentAmountPicker } from "@/components/admin/payment-amount-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditCutDialog({
  cut,
  onClose,
  onSaved,
}: {
  cut: CutRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<CutType>("NORMAL");
  const [note, setNote] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [openForId, setOpenForId] = useState<string | null>(null);
  const cutPrice = useCutPrice();

  // Cada vez que se abre para un corte distinto, precarga sus valores.
  if (cut && cut.id !== openForId) {
    setOpenForId(cut.id);
    setType(cut.type);
    setNote(cut.note ?? "");
    setAmountPaid(cut.amountPaid ?? 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cut) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/cuts/${cut.id}`, {
        type,
        note: note || undefined,
        amountPaid: type === "FIADO" ? amountPaid : undefined,
      });
      toast.success("Corte actualizado.");
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo actualizar el corte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!cut} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar corte{cut?.client ? ` de ${cut.client.fullName}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de corte</Label>
            <Select value={type} onValueChange={(v) => setType(v as CutType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Corte normal</SelectItem>
                <SelectItem value="FIADO">Fiado (a crédito)</SelectItem>
                <SelectItem value="REWARD_FREE">Gratis · Premio por lealtad</SelectItem>
                <SelectItem value="BIRTHDAY_FREE">Gratis · Cumpleaños</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "FIADO" && (
            <PaymentAmountPicker amount={amountPaid} onChange={setAmountPaid} cutPrice={cutPrice} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-note">Nota (opcional)</Label>
            <Textarea
              id="edit-note"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Corte + barba"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
