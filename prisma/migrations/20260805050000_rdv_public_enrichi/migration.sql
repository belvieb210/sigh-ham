-- AlterTable demandes_rendez_vous — champs formulaire public
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "type_prestation" TEXT;
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "creneau" TEXT;
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "date_naissance" TIMESTAMP(3);
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "premiere_visite" BOOLEAN;
ALTER TABLE "demandes_rendez_vous" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'SITE_PUBLIC';

-- Remplir reference pour lignes existantes
UPDATE "demandes_rendez_vous"
SET "reference" = 'HAM-RDV-LEGACY-' || substr(replace("id", '-', ''), 1, 12)
WHERE "reference" IS NULL;

ALTER TABLE "demandes_rendez_vous" ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "demandes_rendez_vous_reference_key" ON "demandes_rendez_vous"("reference");
CREATE INDEX IF NOT EXISTS "demandes_rendez_vous_statut_date_souhaitee_idx" ON "demandes_rendez_vous"("statut", "date_souhaitee");
CREATE INDEX IF NOT EXISTS "demandes_rendez_vous_created_at_idx" ON "demandes_rendez_vous"("created_at");
