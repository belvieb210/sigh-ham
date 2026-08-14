-- Numéro de transfert par orientation (PAT-202600001)
ALTER TABLE "transferts" ADD COLUMN "numero_transfert" TEXT;

CREATE UNIQUE INDEX "transferts_numero_transfert_key" ON "transferts"("numero_transfert");

-- Anciens patients PAT-* → numéro permanent = 1er dossier (YYYYMMDD+seq)
UPDATE "patients" AS p
SET "numero_patient" = d."numero_dossier"
FROM (
  SELECT DISTINCT ON ("patient_id") "patient_id", "numero_dossier"
  FROM "dossiers_patients"
  WHERE "numero_dossier" NOT LIKE 'PH-%'
  ORDER BY "patient_id", "ouvert_le" ASC
) AS d
WHERE p."id" = d."patient_id"
  AND p."numero_patient" LIKE 'PAT-%';

-- Numéros de transfert rétroactifs (ordre chronologique, séquence annuelle)
WITH "ordonnes" AS (
  SELECT
    "id",
    EXTRACT(YEAR FROM "emis_le")::int AS "annee",
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM "emis_le")
      ORDER BY "emis_le" ASC, "created_at" ASC
    ) AS "seq"
  FROM "transferts"
  WHERE "numero_transfert" IS NULL
)
UPDATE "transferts" AS t
SET "numero_transfert" =
  'PAT-' || o."annee"::text || LPAD(o."seq"::text, 6, '0')
FROM "ordonnes" AS o
WHERE t."id" = o."id";
