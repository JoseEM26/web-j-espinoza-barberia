"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Scissors } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { useCutPrice } from "@/lib/use-cut-price";
import type { CutType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentAmountPicker } from "@/components/admin/payment-amount-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TypeOption = "AUTO" | CutType;

export function AddCutDialog({
  clientId,
  clientName,
  onAdded,
}: {
  clientId: string;
  clientName: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [type, setType] = useState<TypeOption>("AUTO");
  const [amountPaid, setAmountPaid] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const cutPrice = useCutPrice();

  function reset() {
    setNote("");
    setType("AUTO");
    setAmountPaid(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/admin/users/${clientId}/cuts`, {
        note: note || undefined,
        type: type === "AUTO" ? undefined : type,
        amountPaid: type === "FIADO" ? amountPaid : undefined,
      });
      toast.success("Corte registrado.");
      setOpen(false);
      reset();
      onAdded();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo registrar el corte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Scissors /> Registrar corte
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar corte de {clientName}</DialogTitle>
          <DialogDescription>
            Deja el tipo en &quot;Automático&quot; para que el sistema detecte cumpleaños o
            corte de premio; o elígelo tú mismo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de corte</Label>
            <Select value={type} onValueChange={(v) => setType(v as TypeOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO">Automático (recomendado)</SelectItem>
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
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Corte + barba"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Guardar corte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
