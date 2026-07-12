"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, ChevronRight } from "lucide-react";
import { useRequireRole } from "@/lib/use-require-role";
import { api } from "@/lib/api-client";
import type { AdminUserListItem, Pagination } from "@/lib/types";
import { AppHeader } from "@/components/layout/app-header";
import { SplashScreen } from "@/components/brand/splash-screen";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "active" | "blocked";

export default function AdminUsersPage() {
  const { user, authorized } = useRequireRole("ADMIN");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [users, setUsers] = useState<AdminUserListItem[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    if (!authorized) return;
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ status });
        if (search) params.set("search", search);
        const data = await api.get<{ users: AdminUserListItem[]; pagination: Pagination }>(
          `/admin/users?${params.toString()}`,
        );
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        toast.error("No se pudo cargar la lista de usuarios.");
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [authorized, search, status]);

  if (!authorized || !user) return <SplashScreen />;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="font-elegant text-2xl italic text-gold-200">Clientes</p>
          <p className="text-sm text-foreground/50">
            Busca, revisa tarjetas y registra cortes.
            {pagination && ` ${pagination.total} en total.`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
            <Input
              placeholder="Buscar por nombre o usuario..."
              maxLength={60}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!users ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-foreground/40">
              No se encontraron clientes.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <Link key={u.id} href={`/admin/users/${u.id}`}>
                <Card className="transition-colors hover:border-gold-500/40">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={u.avatarBase64 ?? undefined} alt={u.fullName} />
                      <AvatarFallback>{u.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base text-foreground">{u.fullName}</p>
                        <Badge variant={u.isActive ? "success" : "destructive"}>
                          {u.isActive ? "Activo" : "Bloqueado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/40">
                        @{u.username} · {u._count.cuts} corte{u._count.cuts === 1 ? "" : "s"}
                      </p>
                      {!u.isActive && u.blockedReason && (
                        <p className="mt-1 truncate text-xs text-red-300/80">
                          Motivo: {u.blockedReason}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground/20" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
