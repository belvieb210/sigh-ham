-- AlterTable
ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "formulaire_clinique" JSONB;
