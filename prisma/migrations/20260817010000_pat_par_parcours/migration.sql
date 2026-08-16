-- PAT identifie le parcours (VIS), pas chaque hop de salle.
DROP INDEX IF EXISTS "transferts_numero_transfert_key";
CREATE INDEX IF NOT EXISTS "transferts_numero_transfert_idx" ON "transferts"("numero_transfert");

-- Tous les transferts d'un même dossier reprennent le premier PAT du parcours.
UPDATE "transferts" AS t
SET "numero_transfert" = premier."numero_transfert"
FROM (
  SELECT DISTINCT ON ("dossier_id")
    "dossier_id",
    "numero_transfert"
  FROM "transferts"
  WHERE "numero_transfert" IS NOT NULL
  ORDER BY "dossier_id", "created_at" ASC
) AS premier
WHERE t."dossier_id" = premier."dossier_id"
  AND t."numero_transfert" IS DISTINCT FROM premier."numero_transfert";
