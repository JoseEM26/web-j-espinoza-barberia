"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Selector rápido de cuánto pagó un cliente en un corte fiado (0 / mitad / todo / manual). */
export function PaymentAmountPicker({
  amount,
  onChange,
  cutPrice,
}: {
  amount: number;
  onChange: (value: number) => void;
  cutPrice: number | null;
}) {
  const half = cutPrice != null ? Math.round((cutPrice / 2) * 100) / 100 : null;

  return (
    <div className="flex flex-col gap-2">
      <Label>¿Cuánto pagó?</Label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={amount === 0 ? "default" : "secondary"}
          onClick={() => onChange(0)}
        >
          No pagó nada
        </Button>
        {half != null && (
          <Button
            type="button"
            size="sm"
            variant={amount === half ? "default" : "secondary"}
            onClick={() => onChange(half)}
          >
            Pagó la mitad (S/ {half.toFixed(2)})
          </Button>
        )}
        {cutPrice != null && (
          <Button
            type="button"
            size="sm"
            variant={amount === cutPrice ? "default" : "secondary"}
            onClick={() => onChange(cutPrice)}
          >
            Pagó todo (S/ {cutPrice.toFixed(2)})
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/40">Monto exacto:</span>
        <Input
          type="number"
          min={0}
          max={cutPrice ?? undefined}
          step={0.5}
          value={Number.isFinite(amount) ? amount : 0}
          onChange={(e) => {
            const value = e.target.valueAsNumber;
            onChange(Number.isFinite(value) ? value : 0);
          }}
          className={cn("h-8 w-28")}
        />
        {cutPrice != null && (
          <span className="text-xs text-foreground/40">de S/ {cutPrice.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
