import { z } from "zod";

export const MAX_IMAGE_BASE64_LENGTH = 2_800_000; // ~2 MB de imagen decodificada

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/]+=*$/;

/** Valida un data URL base64 de imagen (png/jpg/webp), opcional y nulable. */
export const imageBase64Schema = z
  .string()
  .max(MAX_IMAGE_BASE64_LENGTH, "La imagen es demasiado grande. Usa una imagen más liviana.")
  .regex(
    BASE64_IMAGE_PATTERN,
    "La imagen debe ser un data URL base64 válido (png, jpg o webp).",
  )
  .optional()
  .nullable();
