-- CreateEnum
CREATE TYPE "TypeVentePharmacie" AS ENUM ('ORDONNANCE', 'DIRECTE');
CREATE TYPE "StatutVentePharmacie" AS ENUM ('BROUILLON', 'TRANSMISE', 'PAYEE', 'REFUSEE', 'DELIVREE', 'ANNULEE');
CREATE TYPE "TypeMouvementStock" AS ENUM ('ENTREE', 'SORTIE', 'AJUSTEMENT', 'RETOUR');
CREATE TYPE "StatutAchatPharmacie" AS ENUM ('BROUILLON', 'RECU', 'ANNULE');

-- AlterTable medicaments
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "categorie" TEXT;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "prix_achat" DECIMAL(12,2);
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "stock_minimum" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "medicaments" ADD COLUMN IF NOT EXISTS "emplacement" TEXT;

-- AlterTable delivrances_pharmacie : rendre ordonnance optionnelle + pharmacien + vente
ALTER TABLE "delivrances_pharmacie" ALTER COLUMN "ordonnance_id" DROP NOT NULL;
ALTER TABLE "delivrances_pharmacie" ADD COLUMN IF NOT EXISTS "vente_id" TEXT;
ALTER TABLE "delivrances_pharmacie" ADD COLUMN IF NOT EXISTS "pharmacien_id" TEXT;

-- Backfill pharmacien_id from first pharmacien user if null (required later)
UPDATE "delivrances_pharmacie" d
SET "pharmacien_id" = (
  SELECT u.id FROM "utilisateurs" u
  INNER JOIN "roles" r ON r.id = u."role_id"
  WHERE r.code = 'PHARMACIEN'
  LIMIT 1
)
WHERE d."pharmacien_id" IS NULL;

UPDATE "delivrances_pharmacie" d
SET "pharmacien_id" = (SELECT id FROM "utilisateurs" LIMIT 1)
WHERE d."pharmacien_id" IS NULL;

ALTER TABLE "delivrances_pharmacie" ALTER COLUMN "pharmacien_id" SET NOT NULL;

-- Fournisseurs
CREATE TABLE IF NOT EXISTS "fournisseurs_pharmacie" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fournisseurs_pharmacie_pkey" PRIMARY KEY ("id")
);

-- Lots
CREATE TABLE IF NOT EXISTS "lots_medicaments" (
    "id" TEXT NOT NULL,
    "numero_lot" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "fabrique_le" TIMESTAMP(3),
    "expiration_le" TIMESTAMP(3) NOT NULL,
    "fournisseur_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lots_medicaments_pkey" PRIMARY KEY ("id")
);

-- Mouvements
CREATE TABLE IF NOT EXISTS "mouvements_stock" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "type" "TypeMouvementStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "ref_type" TEXT,
    "ref_id" TEXT,
    "notes" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- Ventes
CREATE TABLE IF NOT EXISTS "ventes_pharmacie" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "type" "TypeVentePharmacie" NOT NULL,
    "ordonnance_id" TEXT,
    "statut" "StatutVentePharmacie" NOT NULL DEFAULT 'BROUILLON',
    "facture_id" TEXT,
    "pharmacien_id" TEXT NOT NULL,
    "notes" TEXT,
    "montant_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transmise_le" TIMESTAMP(3),
    "payee_le" TIMESTAMP(3),
    "delivree_le" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ventes_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lignes_vente_pharmacie" (
    "id" TEXT NOT NULL,
    "vente_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DECIMAL(12,2) NOT NULL,
    "remise" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lot_id" TEXT,
    CONSTRAINT "lignes_vente_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lignes_delivrance_pharmacie" (
    "id" TEXT NOT NULL,
    "delivrance_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    CONSTRAINT "lignes_delivrance_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "achats_pharmacie" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseur_id" TEXT NOT NULL,
    "pharmacien_id" TEXT NOT NULL,
    "statut" "StatutAchatPharmacie" NOT NULL DEFAULT 'BROUILLON',
    "notes" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recu_le" TIMESTAMP(3),
    CONSTRAINT "achats_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lignes_achat_pharmacie" (
    "id" TEXT NOT NULL,
    "achat_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "numero_lot" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_achat" DECIMAL(12,2) NOT NULL,
    "expiration_le" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lignes_achat_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "retours_pharmacie" (
    "id" TEXT NOT NULL,
    "vente_id" TEXT NOT NULL,
    "pharmacien_id" TEXT NOT NULL,
    "motif" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "retours_pharmacie_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lignes_retour_pharmacie" (
    "id" TEXT NOT NULL,
    "retour_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    CONSTRAINT "lignes_retour_pharmacie_pkey" PRIMARY KEY ("id")
);

-- Indexes & uniques
CREATE UNIQUE INDEX IF NOT EXISTS "lots_medicaments_medicament_id_numero_lot_key" ON "lots_medicaments"("medicament_id", "numero_lot");
CREATE INDEX IF NOT EXISTS "lots_medicaments_medicament_id_expiration_le_idx" ON "lots_medicaments"("medicament_id", "expiration_le");
CREATE INDEX IF NOT EXISTS "mouvements_stock_lot_id_cree_le_idx" ON "mouvements_stock"("lot_id", "cree_le");
CREATE UNIQUE INDEX IF NOT EXISTS "ventes_pharmacie_numero_key" ON "ventes_pharmacie"("numero");
CREATE UNIQUE INDEX IF NOT EXISTS "ventes_pharmacie_facture_id_key" ON "ventes_pharmacie"("facture_id");
CREATE INDEX IF NOT EXISTS "ventes_pharmacie_statut_cree_le_idx" ON "ventes_pharmacie"("statut", "cree_le");
CREATE UNIQUE INDEX IF NOT EXISTS "achats_pharmacie_numero_key" ON "achats_pharmacie"("numero");

-- Foreign keys
ALTER TABLE "lots_medicaments" ADD CONSTRAINT "lots_medicaments_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lots_medicaments" ADD CONSTRAINT "lots_medicaments_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs_pharmacie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ventes_pharmacie" ADD CONSTRAINT "ventes_pharmacie_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ventes_pharmacie" ADD CONSTRAINT "ventes_pharmacie_ordonnance_id_fkey" FOREIGN KEY ("ordonnance_id") REFERENCES "ordonnances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ventes_pharmacie" ADD CONSTRAINT "ventes_pharmacie_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ventes_pharmacie" ADD CONSTRAINT "ventes_pharmacie_pharmacien_id_fkey" FOREIGN KEY ("pharmacien_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lignes_vente_pharmacie" ADD CONSTRAINT "lignes_vente_pharmacie_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes_pharmacie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lignes_vente_pharmacie" ADD CONSTRAINT "lignes_vente_pharmacie_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lignes_vente_pharmacie" ADD CONSTRAINT "lignes_vente_pharmacie_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_medicaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivrances_pharmacie" ADD CONSTRAINT "delivrances_pharmacie_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes_pharmacie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivrances_pharmacie" ADD CONSTRAINT "delivrances_pharmacie_pharmacien_id_fkey" FOREIGN KEY ("pharmacien_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lignes_delivrance_pharmacie" ADD CONSTRAINT "lignes_delivrance_pharmacie_delivrance_id_fkey" FOREIGN KEY ("delivrance_id") REFERENCES "delivrances_pharmacie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lignes_delivrance_pharmacie" ADD CONSTRAINT "lignes_delivrance_pharmacie_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lignes_delivrance_pharmacie" ADD CONSTRAINT "lignes_delivrance_pharmacie_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "achats_pharmacie" ADD CONSTRAINT "achats_pharmacie_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs_pharmacie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "achats_pharmacie" ADD CONSTRAINT "achats_pharmacie_pharmacien_id_fkey" FOREIGN KEY ("pharmacien_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lignes_achat_pharmacie" ADD CONSTRAINT "lignes_achat_pharmacie_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "achats_pharmacie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lignes_achat_pharmacie" ADD CONSTRAINT "lignes_achat_pharmacie_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lignes_achat_pharmacie" ADD CONSTRAINT "lignes_achat_pharmacie_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_medicaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "retours_pharmacie" ADD CONSTRAINT "retours_pharmacie_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes_pharmacie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "retours_pharmacie" ADD CONSTRAINT "retours_pharmacie_pharmacien_id_fkey" FOREIGN KEY ("pharmacien_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lignes_retour_pharmacie" ADD CONSTRAINT "lignes_retour_pharmacie_retour_id_fkey" FOREIGN KEY ("retour_id") REFERENCES "retours_pharmacie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lignes_retour_pharmacie" ADD CONSTRAINT "lignes_retour_pharmacie_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lignes_retour_pharmacie" ADD CONSTRAINT "lignes_retour_pharmacie_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots_medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
