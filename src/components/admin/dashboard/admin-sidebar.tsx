"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Scissors,
  QrCode,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin#clientes", label: "Clientes", icon: Users },
  { href: "/admin/cuts", label: "Cortes", icon: Scissors },
  { href: "/admin/qr", label: "Código QR", icon: QrCode },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar({ onCloseMobile, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r border-border bg-white p-5 select-none shadow-xs",
        className,
      )}
    >
      {/* Top section: Logo & Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className="group inline-block focus:outline-hidden"
          >
            <Logo className="text-2xl transition-transform duration-150 group-hover:scale-[1.02]" />
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted mt-0.5">
              Panel Administrativo
            </p>
          </Link>
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="lg:hidden text-muted hover:text-primary"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav aria-label="Navegación del Administrador" className="flex flex-col gap-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isExact = pathname === item.href;
            const isClientsAnchor = item.href === "/admin#clientes" && pathname === "/admin";
            const isActive = isExact || (item.href === "/admin" && pathname === "/admin");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive && !isClientsAnchor
                    ? "border border-border/80 bg-surface-2 font-semibold text-primary shadow-2xs"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "size-4.5 transition-colors",
                      isActive && !isClientsAnchor
                        ? "text-primary"
                        : "text-muted group-hover:text-primary",
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && !isClientsAnchor && (
                  <span className="h-4 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Profile & Logout */}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        {user && (
          <div className="flex items-center gap-3 px-1 py-1">
            <Avatar className="size-10 border border-border shadow-2xs shrink-0">
              <AvatarImage src={user.avatarBase64 ?? undefined} alt={user.fullName} />
              <AvatarFallback className="bg-sand-light text-primary font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {user.fullName}
              </p>
              <span className="truncate text-xs text-muted">@{user.username}</span>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 text-muted hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </aside>
  );
}
