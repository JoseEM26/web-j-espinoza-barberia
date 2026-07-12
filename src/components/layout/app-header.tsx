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
    <header className="sticky top-0 z-40 border-b border-surface-border bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="w-32 shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:text-gold-200",
                  pathname === link.href && "bg-gold-500/10 text-gold-200",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="hidden items-center gap-2 sm:flex">
            <div className="text-right">
              <p className="font-display text-sm leading-tight text-gold-100">
                {user.fullName}
              </p>
              <p className="text-xs text-foreground/40">@{user.username}</p>
            </div>
            <Avatar className="size-9">
              <AvatarImage src={user.avatarBase64 ?? undefined} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="outline" size="icon" onClick={handleLogout} title="Cerrar sesión">
            <LogOut />
          </Button>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/60",
              pathname === link.href && "bg-gold-500/10 text-gold-200",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
