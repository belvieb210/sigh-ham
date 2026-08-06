-- CMS vitrine : multi-images campagnes/services + categorie equipe + estPhare

CREATE TABLE IF NOT EXISTS "campagne_images" (
    "id" TEXT NOT NULL,
    "campagne_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "legende" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campagne_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "service_vitrine_images" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "legende" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_vitrine_images_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "services_vitrine" ADD COLUMN IF NOT EXISTS "est_phare" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "medecins_vitrine" ADD COLUMN IF NOT EXISTS "telephone" TEXT;
ALTER TABLE "medecins_vitrine" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "medecins_vitrine" ADD COLUMN IF NOT EXISTS "categorie" TEXT NOT NULL DEFAULT 'MEDECIN';

CREATE INDEX IF NOT EXISTS "campagne_images_campagne_id_ordre_idx" ON "campagne_images"("campagne_id", "ordre");
CREATE INDEX IF NOT EXISTS "service_vitrine_images_service_id_ordre_idx" ON "service_vitrine_images"("service_id", "ordre");
CREATE INDEX IF NOT EXISTS "services_vitrine_est_phare_actif_idx" ON "services_vitrine"("est_phare", "actif");
CREATE INDEX IF NOT EXISTS "medecins_vitrine_categorie_actif_ordre_idx" ON "medecins_vitrine"("categorie", "actif", "ordre");

DO $$ BEGIN
  ALTER TABLE "campagne_images" ADD CONSTRAINT "campagne_images_campagne_id_fkey"
    FOREIGN KEY ("campagne_id") REFERENCES "campagnes_publiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "service_vitrine_images" ADD CONSTRAINT "service_vitrine_images_service_id_fkey"
    FOREIGN KEY ("service_id") REFERENCES "services_vitrine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
