"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { registerFormSchema, type RegisterFormInput } from "@/lib/validators/auth";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SocialFooter } from "@/components/layout/social-footer";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(values: RegisterFormInput) {
    setServerError(null);
    try {
      await api.post("/auth/register", values);
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("No se pudo crear la cuenta. Intenta nuevamente.");
      }
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 w-48 sm:w-56">
          <Logo priority />
        </div>

        <Card>
          <CardHeader className="text-center">
            <p className="font-elegant text-2xl italic text-gold-200">Crea tu cuenta</p>
            <p className="text-sm text-foreground/50">
              Solo necesitamos unos datos, sin correo electrónico
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  maxLength={80}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="tu_usuario"
                  maxLength={20}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && (
                  <p className="text-xs text-red-400">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  maxLength={72}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  maxLength={72}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {serverError && (
                <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </p>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Crear cuenta
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-foreground/50">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-gold-300 hover:underline">
            Inicia sesión
          </Link>
        </p>

        <SocialFooter />
      </div>
    </div>
  );
}
