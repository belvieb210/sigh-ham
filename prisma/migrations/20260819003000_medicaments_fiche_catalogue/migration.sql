-- Fiche catalogue médicament (admin) : champs optionnels, n'impacte pas pharmacie / prescriptions.
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "stock_maximum" INTEGER;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "firme" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "telephone_firme" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "classe_medicamenteuse" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "voie_administration" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "expiration_le" DATE;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "recu_par" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "autres_informations" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "description" TEXT;
