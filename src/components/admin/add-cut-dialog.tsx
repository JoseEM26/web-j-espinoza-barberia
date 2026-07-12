"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Scissors, X } from "lucide-react";
import { api, ApiClientError } from "@/lib/api-client";
import { fileToBase64, FileTooLargeError } from "@/lib/file-to-base64";
import type { CutType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setNote("");
    setType("AUTO");
    setPhoto(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setPhoto(base64);
    } catch (error) {
      toast.error(error instanceof FileTooLargeError ? error.message : "No se pudo leer la imagen.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/admin/users/${clientId}/cuts`, {
        note: note || undefined,
        type: type === "AUTO" ? undefined : type,
        photoBase64: photo ?? undefined,
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Foto (opcional)</Label>
            {photo ? (
              <div className="relative w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Vista previa" className="w-32 rounded-md border border-surface-border" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-950 text-red-200 border border-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <input
                id="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="text-sm text-foreground/60 file:mr-3 file:rounded-md file:border file:border-gold-600/50 file:bg-transparent file:px-3 file:py-1.5 file:text-gold-200 file:text-sm"
              />
            )}
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
