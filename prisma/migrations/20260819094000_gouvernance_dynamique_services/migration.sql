ALTER TABLE "medecins_vitrine"
ADD COLUMN "salle_id" TEXT,
ADD COLUMN "masquer_contacts_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "badge_valeur_1" TEXT,
ADD COLUMN "badge_libelle_1" TEXT,
ADD COLUMN "badge_valeur_2" TEXT,
ADD COLUMN "badge_libelle_2" TEXT,
ADD COLUMN "badge_valeur_3" TEXT,
ADD COLUMN "badge_libelle_3" TEXT;

CREATE INDEX "medecins_vitrine_salle_id_actif_ordre_idx"
ON "medecins_vitrine"("salle_id", "actif", "ordre");

ALTER TABLE "medecins_vitrine"
ADD CONSTRAINT "medecins_vitrine_salle_id_fkey"
FOREIGN KEY ("salle_id") REFERENCES "salles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
