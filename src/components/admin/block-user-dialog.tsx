"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldBan } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BlockUserDialog({
  userId,
  userName,
  onBlocked,
}: {
  userId: string;
  userName: string;
  onBlocked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/admin/users/${userId}/block`, { reason });
      toast.success("Usuario bloqueado.");
      setOpen(false);
      setReason("");
      onBlocked();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo bloquear.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <ShieldBan /> Bloquear
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear a {userName}</DialogTitle>
          <DialogDescription>
            Indica el motivo. Se mostrará a la persona la próxima vez que intente ingresar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Motivo del bloqueo</Label>
            <Textarea
              id="reason"
              required
              minLength={3}
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Faltas reiteradas a citas agendadas"
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Confirmar bloqueo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
