-- Normalise tous les n° transfert PAT → PAT-YYYY + 5 chiffres (ex. PAT-202600001)
WITH "parsed" AS (
  SELECT
    "id",
    (regexp_match("numero_transfert", '^PAT-(\d{4})(\d+)$'))[1] AS "annee",
    (regexp_match("numero_transfert", '^PAT-(\d{4})(\d+)$'))[2]::bigint AS "seq"
  FROM "transferts"
  WHERE "numero_transfert" ~ '^PAT-\d{4}\d+$'
)
UPDATE "transferts" AS t
SET "numero_transfert" = 'PAT-' || p."annee" || LPAD(p."seq"::text, 5, '0')
FROM "parsed" AS p
WHERE t."id" = p."id";
