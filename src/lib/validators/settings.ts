import { z } from "zod";

// Igual patrón que con el teléfono de usuario: el input vacío llega como ""
// (no undefined), así que el refine debe tolerarlo explícitamente.
const instagramUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https:\/\/(www\.)?instagram\.com\/.+/i.test(value), {
    message: "Debe ser un link válido de Instagram (https://instagram.com/usuario).",
  });

const whatsappNumberSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^[0-9+\s-]{6,20}$/.test(value), {
    message: "Número de WhatsApp inválido.",
  })
  .refine((value) => !value || value.replace(/[^0-9]/g, "").length >= 8, {
    message: "El número de WhatsApp debe tener al menos 8 dígitos (con código de país).",
  });

/** Deja solo dígitos (código de país + número), listo para wa.me/<numero>. */
export function normalizeWhatsappNumber(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? digits : null;
}

export function normalizeInstagramUrl(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value ? value : null;
}

export const updateSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(60).optional(),
  cutsRequiredForReward: z.coerce.number().int().min(1).max(100).optional(),
  birthdayDiscountLabel: z.string().trim().min(3).max(150).optional(),
  rewardDiscountLabel: z.string().trim().min(3).max(150).optional(),
  cutPrice: z.coerce.number().min(0).max(10000).optional(),
  instagramUrl: instagramUrlSchema,
  whatsappNumber: whatsappNumberSchema,
});

// Versión para el formulario del cliente: números "reales" (no coercidos),
// ya que el input numérico los entrega vía `valueAsNumber` en react-hook-form.
export const updateSettingsFormSchema = z.object({
  businessName: z.string().trim().min(2).max(60).optional(),
  cutsRequiredForReward: z.number().int().min(1).max(100).optional(),
  birthdayDiscountLabel: z.string().trim().min(3).max(150).optional(),
  rewardDiscountLabel: z.string().trim().min(3).max(150).optional(),
  cutPrice: z.number().min(0).max(10000).optional(),
  instagramUrl: instagramUrlSchema,
  whatsappNumber: whatsappNumberSchema,
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateSettingsFormInput = z.infer<typeof updateSettingsFormSchema>;
