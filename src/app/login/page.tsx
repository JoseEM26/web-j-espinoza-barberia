"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { api, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { AuthUser } from "@/lib/types";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 w-48 sm:w-56">
          <Logo priority />
        </div>

        <Card>
          <CardHeader className="text-center">
            <p className="font-elegant text-2xl italic text-gold-200">Bienvenido de nuevo</p>
            <p className="text-sm text-foreground/50">
              Ingresa a tu cuenta para ver tu tarjeta de fidelidad
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="tu_usuario"
                  maxLength={100}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  maxLength={100}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <p className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </p>
              )}

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-foreground/50">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-gold-300 hover:underline">
            Crea una aquí
          </Link>
        </p>

        <SocialFooter />
      </div>
    </div>
  );
}
