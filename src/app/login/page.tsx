"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { AuthUser } from "@/lib/types";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Card } from "@/components/ui/card";
import { SocialFooter } from "@/components/layout/social-footer";

interface LoginResponse {
  user: AuthUser;
  isBirthdayToday: boolean;
  birthdayMessage: string | null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const data = await api.post<LoginResponse>("/auth/login", values);
      await refresh();
      if (data.isBirthdayToday && data.birthdayMessage) {
        toast.success(data.birthdayMessage, { duration: 6000 });
      }
      const roleHome = data.user.role === "ADMIN" ? "/admin" : "/dashboard";
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : roleHome);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      {/* Glow decorativo sutil en la parte superior */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-36 bg-gradient-to-b from-sand/25 to-transparent rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[390px]">
        {/* Cabecera con Logo y bienvenida */}
        <header className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <Logo priority />
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-dark tracking-tight">
            Bienvenido
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-muted font-medium">
            Acumula sellos, gana 50% de descuento
          </p>
        </header>

        {/* Tarjeta blanca con borde arena */}
        <Card className="p-6 sm:p-7 shadow-xs shadow-primary/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-dark tracking-wide">
                Usuario
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="tu_usuario"
                maxLength={100}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-dark tracking-wide">
                Contraseña
              </Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                maxLength={100}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
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
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Enlace cruzado a registro */}
        <p className="mt-6 text-center text-xs sm:text-sm text-muted">
          ¿Aún no eres miembro?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors ml-0.5"
          >
            Regístrate
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
