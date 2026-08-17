-- Anciens n° de dossier (ENR-YYYY-… / YYYYMMDD+seq) → VISYYYY###### (ex. VIS2026000001).
-- Les n° permanents patients et la série pharmacie PH- ne sont pas modifiés.

WITH "parsed_enr" AS (
  SELECT
    "id",
    (regexp_match(replace("numero_dossier", '-', ''), '^ENR(\d{4})(\d+)$'))[1] AS "annee",
    (regexp_match(replace("numero_dossier", '-', ''), '^ENR(\d{4})(\d+)$'))[2]::bigint AS "seq"
  FROM "dossiers_patients"
  WHERE replace("numero_dossier", '-', '') ~ '^ENR\d{4}\d+$'
)
UPDATE "dossiers_patients" AS d
SET "numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
FROM "parsed_enr" AS p
WHERE d."id" = p."id"
  AND d."numero_dossier" IS DISTINCT FROM ('VIS' || p."annee" || LPAD(p."seq"::text, 6, '0'))
  AND NOT EXISTS (
    SELECT 1
    FROM "dossiers_patients" AS autre
    WHERE autre."id" <> d."id"
      AND autre."numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
  );

WITH "parsed_date" AS (
  SELECT
    "id",
    (regexp_match("numero_dossier", '^(\d{4})\d{4}(\d+)$'))[1] AS "annee",
    (regexp_match("numero_dossier", '^(\d{4})\d{4}(\d+)$'))[2]::bigint AS "seq"
  FROM "dossiers_patients"
  WHERE "numero_dossier" ~ '^\d{8}\d+$'
    AND "numero_dossier" NOT LIKE 'PH-%'
)
UPDATE "dossiers_patients" AS d
SET "numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
FROM "parsed_date" AS p
WHERE d."id" = p."id"
  AND d."numero_dossier" IS DISTINCT FROM ('VIS' || p."annee" || LPAD(p."seq"::text, 6, '0'))
  AND NOT EXISTS (
    SELECT 1
    FROM "dossiers_patients" AS autre
    WHERE autre."id" <> d."id"
      AND autre."numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
  );
