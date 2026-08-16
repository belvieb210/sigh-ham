-- Origine de chaque visite : la salle qui l'a enregistrée.
ALTER TABLE "dossiers_patients"
ADD COLUMN "salle_enregistrement" "CodeSalle" NOT NULL DEFAULT 'RECEPTION';

CREATE INDEX "dossiers_patients_salle_enregistrement_idx"
  ON "dossiers_patients"("salle_enregistrement");

-- Église : prénuptial, transfert ou file d'attente originés EGLISE
UPDATE "dossiers_patients" AS d
SET "salle_enregistrement" = 'EGLISE'
WHERE EXISTS (
  SELECT 1 FROM "examens_prenuptiaux" e WHERE e."dossier_id" = d."id"
)
OR EXISTS (
  SELECT 1 FROM "transferts" t
  INNER JOIN "salles" s ON s."id" = t."salle_origine_id"
  WHERE t."dossier_id" = d."id" AND s."code" = 'EGLISE'
)
OR EXISTS (
  SELECT 1 FROM "passages" p
  INNER JOIN "files_attente" f ON f."passage_id" = p."id"
  INNER JOIN "salles" s ON s."id" = f."salle_id"
  WHERE p."dossier_id" = d."id" AND s."code" = 'EGLISE'
);

-- Médecins externes (prioritaire si le patient leur est rattaché)
UPDATE "dossiers_patients" AS d
SET "salle_enregistrement" = 'MEDECINS_EXTERNES'
FROM "patients" AS p
WHERE d."patient_id" = p."id"
  AND p."medecin_externe_id" IS NOT NULL;

-- Clients walk-in pharmacie
UPDATE "dossiers_patients"
SET "salle_enregistrement" = 'PHARMACIE'
WHERE "numero_dossier" LIKE 'PH-%';
