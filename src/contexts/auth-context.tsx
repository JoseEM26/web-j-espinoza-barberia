"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api-client";
import type { AuthUser } from "@/lib/types";
import { SplashScreen } from "@/components/brand/splash-screen";

interface MeResponse {
  user: AuthUser;
  isBirthdayToday: boolean;
  birthdayMessage: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isBirthdayToday: boolean;
  birthdayMessage: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [birthdayMessage, setBirthdayMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<MeResponse>("/auth/me");
      setUser(data.user);
      setIsBirthdayToday(data.isBirthdayToday);
      setBirthdayMessage(data.birthdayMessage);
    } catch {
      setUser(null);
      setIsBirthdayToday(false);
      setBirthdayMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch de sesión al montar
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
    setIsBirthdayToday(false);
    setBirthdayMessage(null);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <AuthContext.Provider
      value={{ user, isBirthdayToday, birthdayMessage, refresh, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
