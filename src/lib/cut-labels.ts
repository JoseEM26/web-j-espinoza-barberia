import type { CutType } from "@/lib/types";

export const CUT_TYPE_LABELS: Record<CutType, string> = {
  NORMAL: "Corte",
  REWARD_FREE: "Gratis · Lealtad",
  BIRTHDAY_FREE: "Gratis · Cumpleaños",
  FIADO: "Fiado",
};

export const CUT_TYPE_BADGE_VARIANT: Record<CutType, "secondary" | "gold" | "warning"> = {
  NORMAL: "secondary",
  REWARD_FREE: "gold",
  BIRTHDAY_FREE: "gold",
  FIADO: "warning",
};
