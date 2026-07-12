"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ImageOff, Scissors, Trash2 } from "lucide-react";
import type { CutRecord } from "@/lib/types";
import { CUT_TYPE_BADGE_VARIANT, CUT_TYPE_LABELS } from "@/lib/cut-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function CutHistoryList({
  cuts,
  showClient = false,
  emptyMessage = "Todavía no hay cortes registrados.",
  onDelete,
}: {
  cuts: CutRecord[];
  showClient?: boolean;
  emptyMessage?: string;
  onDelete?: (id: string) => void;
}) {
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
              <button
                type="button"
                onClick={() => cut.photoBase64 && setPreviewPhoto(cut.photoBase64)}
                disabled={!cut.photoBase64}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-surface-border bg-surface-2 disabled:cursor-default"
              >
                {cut.photoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cut.photoBase64}
                    alt="Foto del corte"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-5 w-5 text-foreground/20" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={CUT_TYPE_BADGE_VARIANT[cut.type]}>
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
                {cut.note && (
                  <p className="mt-1 truncate text-sm text-foreground/60">{cut.note}</p>
                )}
                {cut.admin && (
                  <p className="mt-1 text-xs text-foreground/30">
                    Registrado por {cut.admin.fullName}
                  </p>
                )}
              </div>

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

      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Foto del corte</DialogTitle>
          {previewPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewPhoto} alt="Foto del corte" className="w-full rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
