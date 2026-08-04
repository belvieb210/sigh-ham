-- AlterTable
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "pack_prenuptial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "examens_prenuptiaux" ADD COLUMN IF NOT EXISTS "conjoint_nom" TEXT;
ALTER TABLE "examens_prenuptiaux" ADD COLUMN IF NOT EXISTS "rapport_pdf_url" TEXT;
