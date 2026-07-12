"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SplashScreen } from "@/components/brand/splash-screen";

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : "/login");
  }, [user, router]);

  return <SplashScreen />;
}
