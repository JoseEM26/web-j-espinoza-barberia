import { z } from "zod";

export const cutTypeSchema = z.enum(["NORMAL", "REWARD_FREE", "BIRTHDAY_FREE", "FIADO"]);

export const createCutSchema = z.object({
  note: z.string().trim().max(300).optional(),
  type: cutTypeSchema.optional(),
  // Solo tiene sentido cuando type === "FIADO"; el tope contra el precio
  // configurado del corte se valida en el endpoint (necesita leer Settings).
  amountPaid: z.number().min(0).max(100000).optional(),
});

export type CreateCutInput = z.infer<typeof createCutSchema>;

export const updateCutPaymentSchema = z.object({
  amountPaid: z.number().min(0).max(100000),
});

/** Edición completa de un corte ya registrado: tipo, nota y (si aplica) pago. */
export const updateCutSchema = z.object({
  type: cutTypeSchema.optional(),
  note: z.string().trim().max(300).optional(),
  amountPaid: z.number().min(0).max(100000).optional(),
});

export type UpdateCutInput = z.infer<typeof updateCutSchema>;
