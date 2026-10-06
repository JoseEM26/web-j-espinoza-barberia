"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { registerFormSchema, type RegisterFormInput } from "@/lib/validators/auth";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Card } from "@/components/ui/card";
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
    <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      {/* Glow decorativo sutil en la parte superior */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-36 bg-gradient-to-b from-sand/25 to-transparent rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[420px]">
        {/* Cabecera con Logo y bienvenida */}
        <header className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <Logo priority />
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-dark tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-muted font-medium">
            Solo necesitamos unos datos, sin correo electrónico
          </p>
        </header>

        {/* Tarjeta blanca con borde arena */}
        <Card className="p-6 sm:p-7 shadow-xs shadow-primary/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-dark tracking-wide">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                placeholder="Juan Pérez"
                maxLength={80}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-dark tracking-wide">
                Usuario
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="tu_usuario"
                maxLength={20}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-xs font-semibold text-dark tracking-wide">
                Fecha de nacimiento
              </Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
              {errors.birthDate && (
                <p className="text-xs text-red-600 font-medium">{errors.birthDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-dark tracking-wide">
                Contraseña
              </Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                maxLength={72}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-dark tracking-wide">
                Confirmar contraseña
              </Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                maxLength={72}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <p className="rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs sm:text-sm text-red-700 font-medium">
                {serverError}
              </p>
            )}

            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full shadow-xs shadow-primary/15"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Enlace cruzado a login */}
        <p className="mt-6 text-center text-xs sm:text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors ml-0.5"
          >
            Inicia sesión
          </Link>
        </p>

        {/* Footer de redes sociales */}
        <SocialFooter />

        <p className="mt-4 text-center text-[10px] text-muted/70 uppercase tracking-wider font-semibold">
          SINCE 2018 • La excelencia del corte clásico
        </p>
      </div>
    </div>
  );
}
