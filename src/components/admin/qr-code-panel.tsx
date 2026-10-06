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
          margin: 3,
          errorCorrectionLevel: "M",
          color: { dark: "#2A1D14", light: "#ffffff" },
        });

        if (cancelled) return;
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
    <Card className="border-border bg-white shadow-sm shadow-[#7A4A2B]/[0.04]">
      <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-8">
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor="qr-url" className="text-sm font-medium text-foreground">
            Link al que apunta el QR
          </Label>
          <Input
            id="qr-url"
            value={url}
            maxLength={300}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tu-dominio.vercel.app/login"
            className="border-border bg-white text-foreground focus-visible:border-primary"
          />
        </div>

        <div className="relative flex items-center justify-center rounded-2xl border border-border bg-white p-5 shadow-md shadow-[#7A4A2B]/[0.06]">
          <canvas
            ref={canvasRef}
            width={QR_PIXEL_SIZE}
            height={QR_PIXEL_SIZE}
            className="h-64 w-64 rounded-lg sm:h-72 sm:w-72"
          />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xs">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="font-display text-xl font-semibold italic text-primary">
            Jota Espinoza
          </p>
          <p className="text-xs uppercase tracking-wider text-muted font-medium mt-0.5">
            Escanea para ingresar a la barbería
          </p>
        </div>

        <Button onClick={handleDownload} size="lg" disabled={rendering} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Descargar QR
        </Button>
      </CardContent>
    </Card>
  );
}
