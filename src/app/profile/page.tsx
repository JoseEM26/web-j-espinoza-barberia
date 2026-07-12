"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import { formatBirthDate } from "@/lib/format-birthdate";
import { fileToBase64, FileTooLargeError } from "@/lib/file-to-base64";
import { updateSelfSchema, type UpdateSelfInput } from "@/lib/validators/user";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, authorized } = useRequireRole();
  const { refresh } = useAuth();
  // undefined = sin cambios; null = se quitó la foto; string = foto nueva.
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSelfInput>({ resolver: zodResolver(updateSelfSchema) });

  useEffect(() => {
    if (user) reset({ fullName: user.fullName });
  }, [user, reset]);

  if (!authorized || !user) return <SplashScreen />;

  const avatarSrc = avatar !== undefined ? avatar : user.avatarBase64;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatar(await fileToBase64(file));
    } catch (error) {
      toast.error(error instanceof FileTooLargeError ? error.message : "No se pudo leer la imagen.");
    } finally {
      e.target.value = "";
    }
  }

  async function onSubmit(values: UpdateSelfInput) {
    try {
      await api.patch("/users/me", { ...values, avatarBase64: avatar });
      await refresh();
      toast.success("Perfil actualizado.");
      setAvatar(undefined);
      reset({ fullName: values.fullName, currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo actualizar tu perfil.");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="font-elegant text-2xl italic text-gold-200">Mi perfil</p>
          <p className="text-sm text-foreground/50">
            Puedes actualizar tu foto, nombre y contraseña.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de la cuenta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-16">
                  <AvatarImage src={avatarSrc ?? undefined} alt={user.fullName} />
                  <AvatarFallback className="text-lg">
                    {user.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar"
                  className="absolute -bottom-1 -right-1 flex size-6 cursor-pointer items-center justify-center rounded-full border border-gold-600/50 bg-surface-2 text-gold-200 hover:bg-surface"
                >
                  <Camera className="size-3.5" />
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              {avatarSrc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvatar(null)}
                  className="text-foreground/40 hover:text-red-400"
                >
                  <X /> Quitar foto
                </Button>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-foreground/50">Usuario</span>
              <span className="text-foreground/90">@{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Fecha de nacimiento</span>
              <span className="text-foreground/90">{formatBirthDate(user.birthDate)}</span>
            </div>
            <p className="text-xs text-foreground/30">
              El usuario y la fecha de nacimiento solo puede modificarlos el administrador.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" maxLength={80} {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-xs text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <Separator />
              <p className="text-xs uppercase tracking-[0.15em] text-gold-300/70">
                Cambiar contraseña (opcional)
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <PasswordInput
                  id="currentPassword"
                  autoComplete="current-password"
                  maxLength={72}
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-red-400">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <PasswordInput
                  id="newPassword"
                  autoComplete="new-password"
                  maxLength={72}
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-400">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmNewPassword">Confirmar nueva contraseña</Label>
                <PasswordInput
                  id="confirmNewPassword"
                  autoComplete="new-password"
                  maxLength={72}
                  {...register("confirmNewPassword")}
                />
                {errors.confirmNewPassword && (
                  <p className="text-xs text-red-400">{errors.confirmNewPassword.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
