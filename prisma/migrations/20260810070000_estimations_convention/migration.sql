-- CreateEnum
CREATE TYPE "StatutEstimationConvention" AS ENUM ('EMIS', 'ENVOYEE_CAISSE', 'TRAITE', 'ANNULE');

-- CreateTable
CREATE TABLE "estimations_convention" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "transfert_id" TEXT,
    "emetteur_id" TEXT NOT NULL,
    "nom_convention" TEXT,
    "medecin_responsable" TEXT NOT NULL,
    "sous_total_usd" DECIMAL(12,2) NOT NULL,
    "remise_usd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "honoraire_pct" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "honoraire_usd" DECIMAL(12,2) NOT NULL,
    "total_patient_usd" DECIMAL(12,2) NOT NULL,
    "pdf_url" TEXT,
    "statut" "StatutEstimationConvention" NOT NULL DEFAULT 'EMIS',
    "emis_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envoye_caisse_le" TIMESTAMP(3),

    CONSTRAINT "estimations_convention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimation_convention_lignes" (
    "id" TEXT NOT NULL,
    "estimation_id" TEXT NOT NULL,
    "type_examen_id" TEXT,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "prix_unitaire" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "estimation_convention_lignes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estimations_convention_transfert_id_key" ON "estimations_convention"("transfert_id");

-- CreateIndex
CREATE INDEX "estimations_convention_dossier_id_idx" ON "estimations_convention"("dossier_id");

-- CreateIndex
CREATE INDEX "estimations_convention_emis_le_idx" ON "estimations_convention"("emis_le");

-- CreateIndex
CREATE INDEX "estimations_convention_statut_idx" ON "estimations_convention"("statut");

-- AddForeignKey
ALTER TABLE "estimations_convention" ADD CONSTRAINT "estimations_convention_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimations_convention" ADD CONSTRAINT "estimations_convention_transfert_id_fkey" FOREIGN KEY ("transfert_id") REFERENCES "transferts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimations_convention" ADD CONSTRAINT "estimations_convention_emetteur_id_fkey" FOREIGN KEY ("emetteur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimation_convention_lignes" ADD CONSTRAINT "estimation_convention_lignes_estimation_id_fkey" FOREIGN KEY ("estimation_id") REFERENCES "estimations_convention"("id") ON DELETE CASCADE ON UPDATE CASCADE;
