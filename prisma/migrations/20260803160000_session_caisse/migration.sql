-- CreateTable
CREATE TABLE "sessions_caisse" (
    "id" TEXT NOT NULL,
    "caissier_id" TEXT NOT NULL,
    "numero_caisse" TEXT NOT NULL DEFAULT '01',
    "solde_ouverture" DECIMAL(12,2) NOT NULL,
    "ouverte_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cloturee_le" TIMESTAMP(3),
    "solde_cloture" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_caisse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_caisse_caissier_id_cloturee_le_idx" ON "sessions_caisse"("caissier_id", "cloturee_le");

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_caissier_id_fkey" FOREIGN KEY ("caissier_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
