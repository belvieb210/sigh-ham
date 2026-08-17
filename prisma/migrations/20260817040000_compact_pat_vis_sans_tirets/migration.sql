-- Anciens n° VIS / PAT avec tirets → format compact (année calendaire conservée).
-- VIS-2026-000001 → VIS2026000001
-- PAT-202600002 / PAT-2026-00002 → PAT202600002

WITH "parsed_vis" AS (
  SELECT
    "id",
    (regexp_match(replace("numero_dossier", '-', ''), '^VIS(\d{4})(\d+)$'))[1] AS "annee",
    (regexp_match(replace("numero_dossier", '-', ''), '^VIS(\d{4})(\d+)$'))[2]::bigint AS "seq"
  FROM "dossiers_patients"
  WHERE replace("numero_dossier", '-', '') ~ '^VIS\d{4}\d+$'
)
UPDATE "dossiers_patients" AS d
SET "numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
FROM "parsed_vis" AS p
WHERE d."id" = p."id"
  AND d."numero_dossier" IS DISTINCT FROM ('VIS' || p."annee" || LPAD(p."seq"::text, 6, '0'))
  AND NOT EXISTS (
    SELECT 1
    FROM "dossiers_patients" AS autre
    WHERE autre."id" <> d."id"
      AND autre."numero_dossier" = 'VIS' || p."annee" || LPAD(p."seq"::text, 6, '0')
  );

WITH "parsed_pat" AS (
  SELECT
    "id",
    (regexp_match(replace("numero_transfert", '-', ''), '^PAT(\d{4})(\d+)$'))[1] AS "annee",
    (regexp_match(replace("numero_transfert", '-', ''), '^PAT(\d{4})(\d+)$'))[2]::bigint AS "seq"
  FROM "transferts"
  WHERE "numero_transfert" IS NOT NULL
    AND replace("numero_transfert", '-', '') ~ '^PAT\d{4}\d+$'
)
UPDATE "transferts" AS t
SET "numero_transfert" = 'PAT' || p."annee" || LPAD(p."seq"::text, 5, '0')
FROM "parsed_pat" AS p
WHERE t."id" = p."id"
  AND t."numero_transfert" IS DISTINCT FROM ('PAT' || p."annee" || LPAD(p."seq"::text, 5, '0'));
