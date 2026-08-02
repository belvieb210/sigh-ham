-- AlterTable
ALTER TABLE "enregistrements_reception" ADD COLUMN "medecin_responsable" TEXT NOT NULL DEFAULT '';
ALTER TABLE "enregistrements_reception" ADD COLUMN "est_estimation" BOOLEAN NOT NULL DEFAULT false;
