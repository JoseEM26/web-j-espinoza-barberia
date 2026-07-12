import { z } from "zod";
import { imageBase64Schema } from "./image";

export const photoBase64Schema = imageBase64Schema;

export const cutTypeSchema = z.enum(["NORMAL", "REWARD_FREE", "BIRTHDAY_FREE", "FIADO"]);

export const createCutSchema = z.object({
  photoBase64: photoBase64Schema,
  note: z.string().trim().max(300).optional(),
  type: cutTypeSchema.optional(),
});

export type CreateCutInput = z.infer<typeof createCutSchema>;
