-- Caisse examens : dollars (USD). Les factures pharmacie restent en Fc (CDF).
ALTER TABLE "factures" ALTER COLUMN "devise" SET DEFAULT 'USD';

UPDATE "factures"
SET "devise" = 'USD'
WHERE "devise" = 'CDF'
  AND "id" NOT IN (
    SELECT "facture_id" FROM "ventes_pharmacie" WHERE "facture_id" IS NOT NULL
  );
