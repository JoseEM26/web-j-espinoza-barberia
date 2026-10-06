"use client";

import { useEffect, useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/social-icons";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/lib/types";

export function SocialFooter() {
  const [settings, setSettings] = useState<Pick<
    BusinessSettings,
    "instagramUrl" | "whatsappNumber"
  > | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ settings: BusinessSettings }>("/settings");
        setSettings(data.settings);
      } catch {
        // Silencioso: el footer social es decorativo, no bloquea la página.
      }
    })();
  }, []);

  const instagramUrl = settings?.instagramUrl;
  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}`
    : null;

  if (!instagramUrl && !whatsappUrl) return null;

  return (
    <div className="mt-10 mb-6 flex flex-col items-center gap-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Síguenos</p>
      <div className="flex items-center justify-center gap-3">
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Síguenos en Instagram"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-muted shadow-xs transition-colors hover:border-primary hover:text-primary hover:bg-surface-2"
          >
            <InstagramIcon className="size-4" />
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Escríbenos por WhatsApp"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-muted shadow-xs transition-colors hover:border-primary hover:text-primary hover:bg-surface-2"
          >
            <WhatsAppIcon className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}
