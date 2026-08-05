-- AlterTable
ALTER TABLE "ordonnances" ADD COLUMN IF NOT EXISTS "details_prescription" JSONB;
