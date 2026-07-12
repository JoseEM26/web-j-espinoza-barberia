"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/lib/types";

/** Precio de referencia del corte, configurable por el admin en /admin/settings. */
export function useCutPrice(): number | null {
  const [cutPrice, setCutPrice] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ settings: BusinessSettings }>("/settings");
        setCutPrice(data.settings.cutPrice);
      } catch {
        // Silencioso: si falla, los campos de pago simplemente no muestran tope.
      }
    })();
  }, []);

  return cutPrice;
}
