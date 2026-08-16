-- AlterTable
ALTER TABLE "examens_laboratoire" ADD COLUMN "paquet_bilan_id" TEXT;

-- AddForeignKey
ALTER TABLE "examens_laboratoire" ADD CONSTRAINT "examens_laboratoire_paquet_bilan_id_fkey" FOREIGN KEY ("paquet_bilan_id") REFERENCES "paquets_bilans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "examens_laboratoire_paquet_bilan_id_idx" ON "examens_laboratoire"("paquet_bilan_id");
