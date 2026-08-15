-- Clients walk-in pharmacie : le n° permanent = n° dossier PH-* (pas la série patient hospitalier)
UPDATE "patients" AS p
SET "numero_patient" = d."numero_dossier"
FROM "dossiers_patients" AS d
WHERE d."patient_id" = p."id"
  AND d."numero_dossier" LIKE 'PH-%'
  AND p."numero_patient" NOT LIKE 'PH-%';
