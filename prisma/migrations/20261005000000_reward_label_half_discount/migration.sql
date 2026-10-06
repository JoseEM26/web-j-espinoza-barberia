-- El premio por lealtad ahora es 50% de descuento (antes corte gratis).
ALTER TABLE "Settings" ALTER COLUMN "rewardDiscountLabel" SET DEFAULT '¡50% de descuento por lealtad!';
UPDATE "Settings" SET "rewardDiscountLabel" = '¡50% de descuento por lealtad!' WHERE "rewardDiscountLabel" = '¡Corte gratis por lealtad!';
