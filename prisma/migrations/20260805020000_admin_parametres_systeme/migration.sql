-- CreateTable
CREATE TABLE "parametres_systeme" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parametres_systeme_pkey" PRIMARY KEY ("cle")
);

-- CreateIndex
CREATE INDEX "parametres_systeme_categorie_idx" ON "parametres_systeme"("categorie");
