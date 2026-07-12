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
    <div className="mt-8 flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-[0.15em] text-foreground/30">Síguenos</p>
      <div className="flex items-center justify-center gap-4">
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Síguenos en Instagram"
            className="flex size-9 items-center justify-center rounded-full border border-surface-border text-foreground/50 transition-colors hover:border-gold-500/50 hover:text-gold-300"
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
            className="flex size-9 items-center justify-center rounded-full border border-surface-border text-foreground/50 transition-colors hover:border-gold-500/50 hover:text-gold-300"
          >
            <WhatsAppIcon className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}
