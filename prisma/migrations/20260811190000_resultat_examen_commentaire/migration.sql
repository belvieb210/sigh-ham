-- Commentaire optionnel par paramètre de résultat d'examen
ALTER TABLE "resultats_examen" ADD COLUMN IF NOT EXISTS "commentaire" TEXT;
