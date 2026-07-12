import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El usuario debe tener al menos 3 caracteres.")
  .max(20, "El usuario no puede superar los 20 caracteres.")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_.]*$/,
    "El usuario debe empezar con una letra y solo puede contener letras, números, '_' y '.'.",
  )
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "La contraseña no puede superar los 72 caracteres.")
  .regex(/[a-zA-Z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número.");

export const birthDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Fecha de nacimiento inválida.",
  })
  .transform((value) => new Date(value))
  .refine((date) => date.getTime() <= Date.now(), {
    message: "La fecha de nacimiento no puede ser en el futuro.",
  })
  .refine((date) => date.getFullYear() >= 1900, {
    message: "Fecha de nacimiento inválida.",
  });

// Igual que birthDateSchema pero sin transformar a Date: para usarse en
// formularios del cliente, donde el input HTML produce un string y el
// propio backend se encarga de la validación/transformación autoritativa.
export const birthDateInputSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Fecha de nacimiento inválida.",
  })
  .refine((value) => new Date(value).getTime() <= Date.now(), {
    message: "La fecha de nacimiento no puede ser en el futuro.",
  })
  .refine((value) => new Date(value).getFullYear() >= 1900, {
    message: "Fecha de nacimiento inválida.",
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "El nombre completo debe tener al menos 3 caracteres.")
  .max(80, "El nombre completo no puede superar los 80 caracteres.");

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: fullNameSchema,
    birthDate: birthDateSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

// Versión para el formulario del cliente: mismo criterio, pero birthDate
// se queda como string (el backend hace la transformación autoritativa).
export const registerFormSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: fullNameSchema,
    birthDate: birthDateInputSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Ingresa tu usuario."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
