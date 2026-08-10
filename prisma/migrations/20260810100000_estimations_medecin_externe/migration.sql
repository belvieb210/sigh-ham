-- CreateEnum
CREATE TYPE "TypeEstimationHonoraires" AS ENUM ('CONVENTION_EGLISE', 'MEDECIN_EXTERNE');

-- AlterTable
ALTER TABLE "estimations_convention" ADD COLUMN "type_estimation" "TypeEstimationHonoraires" NOT NULL DEFAULT 'CONVENTION_EGLISE';
ALTER TABLE "estimations_convention" ADD COLUMN "medecin_externe_id" TEXT;
ALTER TABLE "estimations_convention" ADD COLUMN "traite_le" TIMESTAMP(3);
ALTER TABLE "estimations_convention" ADD COLUMN "traite_par_id" TEXT;

-- CreateIndex
CREATE INDEX "estimations_convention_type_estimation_idx" ON "estimations_convention"("type_estimation");
CREATE INDEX "estimations_convention_medecin_externe_id_idx" ON "estimations_convention"("medecin_externe_id");

-- AddForeignKey
ALTER TABLE "estimations_convention" ADD CONSTRAINT "estimations_convention_medecin_externe_id_fkey" FOREIGN KEY ("medecin_externe_id") REFERENCES "medecins_externes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "estimations_convention" ADD CONSTRAINT "estimations_convention_traite_par_id_fkey" FOREIGN KEY ("traite_par_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
