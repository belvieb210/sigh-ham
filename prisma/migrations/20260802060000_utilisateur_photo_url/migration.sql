-- Photo de profil utilisateur
ALTER TABLE "utilisateurs" ADD COLUMN IF NOT EXISTS "photo_url" TEXT;
