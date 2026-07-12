import { z } from "zod";
import {
  birthDateInputSchema,
  birthDateSchema,
  fullNameSchema,
  passwordSchema,
  usernameSchema,
} from "./auth";
import { imageBase64Schema } from "./image";

/** El propio usuario solo puede tocar su nombre, foto de perfil y contraseña. */
export const updateSelfSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    avatarBase64: imageBase64Schema,
    currentPassword: z.string().optional(),
    newPassword: passwordSchema.optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Debes ingresar tu contraseña actual para cambiarla.",
    path: ["currentPassword"],
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"],
  });

/** El administrador puede editar cualquier dato del perfil de un cliente. */
export const adminUpdateUserSchema = z.object({
  username: usernameSchema.optional(),
  fullName: fullNameSchema.optional(),
  birthDate: birthDateSchema.optional(),
});

// Versión para el formulario del admin: birthDate como string (el input
// HTML produce texto; el backend hace la transformación autoritativa).
export const adminUpdateUserFormSchema = z.object({
  username: usernameSchema.optional(),
  fullName: fullNameSchema.optional(),
  birthDate: birthDateInputSchema.optional(),
});

export const adminResetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"],
  });

export const blockUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Debes indicar el motivo del bloqueo.")
    .max(200, "El motivo no puede superar los 200 caracteres."),
});

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["active", "blocked", "all"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type UpdateSelfInput = z.infer<typeof updateSelfSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminUpdateUserFormInput = z.infer<typeof adminUpdateUserFormSchema>;
