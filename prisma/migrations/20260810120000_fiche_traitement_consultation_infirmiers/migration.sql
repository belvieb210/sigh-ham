-- CreateEnum
CREATE TYPE "StatutFicheTraitement" AS ENUM ('EN_COURS', 'CLOTURE', 'ANNULE');

-- AlterTable
ALTER TABLE "constantes_vitales" ADD COLUMN "formulaire_clinique" JSONB;

-- CreateTable
CREATE TABLE "fiches_traitement" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "infirmier_id" TEXT NOT NULL,
    "medecin_prescripteur" TEXT,
    "tel_prescripteur" TEXT,
    "numero_recu" TEXT,
    "poids_kg" DECIMAL(5,2),
    "sexe" TEXT,
    "debut_traitement_le" TIMESTAMP(3) NOT NULL,
    "fin_traitement_le" TIMESTAMP(3) NOT NULL,
    "jours_prolongation" INTEGER NOT NULL DEFAULT 0,
    "statut" "StatutFicheTraitement" NOT NULL DEFAULT 'EN_COURS',
    "pdf_url" TEXT,
    "cloture_le" TIMESTAMP(3),
    "cloture_par_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiches_traitement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_traitement" (
    "id" TEXT NOT NULL,
    "fiche_id" TEXT NOT NULL,
    "effectue_le" TIMESTAMP(3),
    "medicament" TEXT NOT NULL,
    "dose_quantite" TEXT,
    "nom_traiteur" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lignes_traitement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaires_traitement" (
    "id" TEXT NOT NULL,
    "fiche_id" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "commentaires_traitement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichiers_traitement" (
    "id" TEXT NOT NULL,
    "fiche_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type_mime" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fichiers_traitement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fiches_traitement_dossier_id_idx" ON "fiches_traitement"("dossier_id");
CREATE INDEX "fiches_traitement_statut_idx" ON "fiches_traitement"("statut");
CREATE INDEX "fiches_traitement_fin_traitement_le_idx" ON "fiches_traitement"("fin_traitement_le");

-- AddForeignKey
ALTER TABLE "fiches_traitement" ADD CONSTRAINT "fiches_traitement_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiches_traitement" ADD CONSTRAINT "fiches_traitement_infirmier_id_fkey" FOREIGN KEY ("infirmier_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiches_traitement" ADD CONSTRAINT "fiches_traitement_cloture_par_id_fkey" FOREIGN KEY ("cloture_par_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lignes_traitement" ADD CONSTRAINT "lignes_traitement_fiche_id_fkey" FOREIGN KEY ("fiche_id") REFERENCES "fiches_traitement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commentaires_traitement" ADD CONSTRAINT "commentaires_traitement_fiche_id_fkey" FOREIGN KEY ("fiche_id") REFERENCES "fiches_traitement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fichiers_traitement" ADD CONSTRAINT "fichiers_traitement_fiche_id_fkey" FOREIGN KEY ("fiche_id") REFERENCES "fiches_traitement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
