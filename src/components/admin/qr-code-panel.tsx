"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_URL = "https://j-espinoza.vercel.app/login?next=%2Fdashboard";
const QR_PIXEL_SIZE = 560;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + size, y, x + size, y + size, radius);
  ctx.arcTo(x + size, y + size, x, y + size, radius);
  ctx.arcTo(x, y + size, x, y, radius);
  ctx.arcTo(x, y, x + size, y, radius);
  ctx.closePath();
}

export function QrCodePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas || !url) return;
      setRendering(true);

      try {
        await QRCode.toCanvas(canvas, url, {
          width: QR_PIXEL_SIZE,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: "#151008", light: "#ffffff" },
        });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new Image();
        logo.src = "/logo-emblem.png";
        await new Promise<void>((resolve, reject) => {
          logo.onload = () => resolve();
          logo.onerror = () => reject(new Error("no se pudo cargar el emblema"));
        });
        if (cancelled) return;

        const badgeSize = QR_PIXEL_SIZE * 0.26;
        const badgeX = (canvas.width - badgeSize) / 2;
        const badgeY = (canvas.height - badgeSize) / 2;

        ctx.fillStyle = "#ffffff";
        drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize * 0.2);
        ctx.fill();

        const logoSize = badgeSize * 0.8;
        ctx.drawImage(
          logo,
          badgeX + (badgeSize - logoSize) / 2,
          badgeY + (badgeSize - logoSize) / 2,
          logoSize,
          logoSize,
        );
      } catch {
        toast.error("No se pudo generar el código QR.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "jespinoza-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR descargado.");
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor="qr-url">Link al que apunta el QR</Label>
          <Input
            id="qr-url"
            value={url}
            maxLength={300}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tu-dominio.vercel.app/login"
          />
        </div>

        <div className="relative flex items-center justify-center rounded-2xl border border-gold-500/30 bg-white p-5 shadow-[0_0_40px_rgba(211,165,63,0.12)]">
          <canvas
            ref={canvasRef}
            width={QR_PIXEL_SIZE}
            height={QR_PIXEL_SIZE}
            className="h-64 w-64 sm:h-72 sm:w-72"
          />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
              <Loader2 className="size-6 animate-spin text-gold-600" />
            </div>
          )}
        </div>

        <p className="text-center font-elegant text-lg italic text-gold-200">
          Escanea para ingresar a JEspinoza Barbershop
        </p>

        <Button onClick={handleDownload} size="lg" disabled={rendering}>
          <Download /> Descargar QR
        </Button>
      </CardContent>
    </Card>
  );
}
