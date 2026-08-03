-- AlterTable
ALTER TABLE "factures" ADD COLUMN "approuvee_le" TIMESTAMP(3);
ALTER TABLE "factures" ADD COLUMN "approuvee_par_id" TEXT;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_approuvee_par_id_fkey" FOREIGN KEY ("approuvee_par_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
