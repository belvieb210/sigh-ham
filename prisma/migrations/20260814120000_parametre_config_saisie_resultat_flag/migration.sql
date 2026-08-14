-- Config saisie par paramètre + flag / valeur secondaire sur les résultats

ALTER TABLE "parametres_type_examen"
  ADD COLUMN IF NOT EXISTS "config_saisie" JSONB;

ALTER TABLE "resultats_examen"
  ADD COLUMN IF NOT EXISTS "flag" TEXT,
  ADD COLUMN IF NOT EXISTS "valeur_secondaire" TEXT;
