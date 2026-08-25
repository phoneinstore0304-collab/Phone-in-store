-- AlterTable
ALTER TABLE "TradeInRequest" ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3);

-- Backfill: los pedidos que ya existían son de antes de que existiera el
-- popup de términos y condiciones, así que no hay un valor real que
-- rescatar — se usa createdAt como aproximación en vez de perder las filas.
UPDATE "TradeInRequest" SET "acceptedTermsAt" = "createdAt" WHERE "acceptedTermsAt" IS NULL;

ALTER TABLE "TradeInRequest" ALTER COLUMN "acceptedTermsAt" SET NOT NULL;
