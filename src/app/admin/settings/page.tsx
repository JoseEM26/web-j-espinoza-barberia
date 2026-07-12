"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import {
  updateSettingsFormSchema,
  type UpdateSettingsFormInput,
} from "@/lib/validators/settings";
import { api, ApiClientError } from "@/lib/api-client";
import type { BusinessSettings } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  const { user, authorized } = useRequireRole("ADMIN");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSettingsFormInput>({ resolver: zodResolver(updateSettingsFormSchema) });

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const data = await api.get<{ settings: BusinessSettings }>("/admin/settings");
        reset({
          businessName: data.settings.businessName,
          cutsRequiredForReward: data.settings.cutsRequiredForReward,
          birthdayDiscountLabel: data.settings.birthdayDiscountLabel,
          rewardDiscountLabel: data.settings.rewardDiscountLabel,
          cutPrice: data.settings.cutPrice,
          instagramUrl: data.settings.instagramUrl ?? undefined,
          whatsappNumber: data.settings.whatsappNumber ?? undefined,
        });
      } catch {
        toast.error("No se pudo cargar la configuración.");
      }
    })();
  }, [authorized, reset]);

  if (!authorized || !user) return <SplashScreen />;

  async function onSubmit(values: UpdateSettingsFormInput) {
    try {
      const data = await api.patch<{ settings: BusinessSettings }>("/admin/settings", values);
      toast.success("Configuración actualizada.");
      reset({
        businessName: data.settings.businessName,
        cutsRequiredForReward: data.settings.cutsRequiredForReward,
        birthdayDiscountLabel: data.settings.birthdayDiscountLabel,
        rewardDiscountLabel: data.settings.rewardDiscountLabel,
        cutPrice: data.settings.cutPrice,
        instagramUrl: data.settings.instagramUrl ?? undefined,
        whatsappNumber: data.settings.whatsappNumber ?? undefined,
      });
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo guardar.");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="font-elegant text-2xl italic text-gold-200">Configuración</p>
          <p className="text-sm text-foreground/50">
            Ajusta las reglas de la tarjeta de fidelidad y los textos del negocio.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del negocio</CardTitle>
            <CardDescription>Todo aquí es editable, nada queda fijo en el código.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input id="businessName" maxLength={60} {...register("businessName")} />
                {errors.businessName && (
                  <p className="text-xs text-red-400">{errors.businessName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cutsRequiredForReward">Cortes para ganar uno gratis</Label>
                <Input
                  id="cutsRequiredForReward"
                  type="number"
                  min={1}
                  max={100}
                  {...register("cutsRequiredForReward", { valueAsNumber: true })}
                />
                {errors.cutsRequiredForReward && (
                  <p className="text-xs text-red-400">{errors.cutsRequiredForReward.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rewardDiscountLabel">Mensaje de corte gratis por lealtad</Label>
                <Textarea id="rewardDiscountLabel" maxLength={150} {...register("rewardDiscountLabel")} />
                {errors.rewardDiscountLabel && (
                  <p className="text-xs text-red-400">{errors.rewardDiscountLabel.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="birthdayDiscountLabel">Mensaje de descuento de cumpleaños</Label>
                <Textarea id="birthdayDiscountLabel" maxLength={150} {...register("birthdayDiscountLabel")} />
                {errors.birthdayDiscountLabel && (
                  <p className="text-xs text-red-400">{errors.birthdayDiscountLabel.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cutPrice">Precio del corte (S/)</Label>
                <Input
                  id="cutPrice"
                  type="number"
                  min={0}
                  max={10000}
                  step={0.5}
                  {...register("cutPrice", { valueAsNumber: true })}
                />
                {errors.cutPrice && (
                  <p className="text-xs text-red-400">{errors.cutPrice.message}</p>
                )}
                <p className="text-xs text-foreground/40">
                  Es el tope para cuánto se puede registrar como pagado en un corte fiado.
                </p>
              </div>

              <Separator />
              <p className="text-xs uppercase tracking-[0.15em] text-gold-300/70">
                Redes sociales
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <Input
                  id="instagramUrl"
                  maxLength={150}
                  placeholder="https://www.instagram.com/tu_usuario/"
                  {...register("instagramUrl")}
                />
                {errors.instagramUrl && (
                  <p className="text-xs text-red-400">{errors.instagramUrl.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="whatsappNumber">WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  maxLength={20}
                  placeholder="+51 975 026 835"
                  {...register("whatsappNumber")}
                />
                {errors.whatsappNumber && (
                  <p className="text-xs text-red-400">{errors.whatsappNumber.message}</p>
                )}
                <p className="text-xs text-foreground/40">
                  Incluye el código de país. Los clientes lo verán como un botón directo a WhatsApp.
                </p>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Guardar configuración
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
