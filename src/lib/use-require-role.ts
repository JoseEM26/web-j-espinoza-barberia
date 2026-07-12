"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { Role } from "@/lib/types";

/** Protege una página: redirige a /login si no hay sesión, o al home del rol correcto si no coincide. */
export function useRequireRole(requiredRole?: Role) {
  const { user } = useAuth();
  const router = useRouter();
  const authorized = !!user && (!requiredRole || user.role === requiredRole);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [user, requiredRole, router]);

  return { user, authorized };
}
