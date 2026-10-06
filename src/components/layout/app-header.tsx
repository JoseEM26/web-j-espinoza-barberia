"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const CLIENT_LINKS = [{ href: "/dashboard", label: "Mi tarjeta" }];
const ADMIN_LINKS = [
  { href: "/admin", label: "Usuarios" },
  { href: "/admin/cuts", label: "Cortes" },
  { href: "/admin/qr", label: "QR" },
  { href: "/admin/settings", label: "Configuración" },
];

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const links = user.role === "ADMIN" ? ADMIN_LINKS : CLIENT_LINKS;

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
            className="shrink-0 flex items-center transition-opacity hover:opacity-90"
          >
            <Logo className="text-xl sm:text-2xl" />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-primary hover:bg-surface-2",
                  pathname === link.href &&
                    "bg-surface-2 text-primary font-semibold border border-border/80 shadow-2xs",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="hidden items-center gap-2.5 sm:flex group">
            <div className="text-right">
              <p className="font-display text-sm leading-tight font-semibold text-foreground group-hover:text-primary transition-colors">
                {user.fullName}
              </p>
              <p className="text-xs text-muted">@{user.username}</p>
            </div>
            <Avatar className="size-9 ring-1 ring-border">
              <AvatarImage src={user.avatarBase64 ?? undefined} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-muted hover:text-primary hover:border-sand"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden border-t border-border/40 pt-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-muted transition-colors",
              pathname === link.href &&
                "bg-surface-2 text-primary font-semibold border border-border/80",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
