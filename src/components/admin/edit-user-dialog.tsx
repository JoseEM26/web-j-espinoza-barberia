"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import {
  adminUpdateUserFormSchema,
  type AdminUpdateUserFormInput,
} from "@/lib/validators/user";
import { api, ApiClientError } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/format-birthdate";
import type { AdminUserDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditUserDialog({
  user,
  onSaved,
}: {
  user: AdminUserDetail;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminUpdateUserFormInput>({
    resolver: zodResolver(adminUpdateUserFormSchema),
    values: {
      username: user.username,
      fullName: user.fullName,
      birthDate: toDateInputValue(user.birthDate),
    },
  });

  async function onSubmit(values: AdminUpdateUserFormInput) {
    try {
      await api.patch(`/admin/users/${user.id}`, values);
      toast.success("Usuario actualizado.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "No se pudo actualizar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar a {user.fullName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input id="fullName" maxLength={80} {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" maxLength={20} {...register("username")} />
            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && <p className="text-xs text-red-400">{errors.birthDate.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
