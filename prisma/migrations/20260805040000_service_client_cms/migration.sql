-- AlterEnum
ALTER TYPE "CodeSalle" ADD VALUE IF NOT EXISTS 'CLIENT';

-- CreateTable
CREATE TABLE "campagnes_publiques" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "extrait" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "categorie" TEXT NOT NULL,
    "type_publication" TEXT NOT NULL,
    "publie" BOOLEAN NOT NULL DEFAULT false,
    "mis_en_avant" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "lieu" TEXT,
    "couleur_fond" TEXT NOT NULL DEFAULT '#E8F4FC',
    "couleur_illustration" TEXT NOT NULL DEFAULT '#0B6E99',
    "couleur_accent" TEXT NOT NULL DEFAULT '#0B6E99',
    "icone" TEXT NOT NULL DEFAULT 'coeur',
    "date_publication" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campagnes_publiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diapositives_hero" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "titre" TEXT,
    "lien_href" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diapositives_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages_publiques" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" JSONB NOT NULL DEFAULT '{}',
    "publie" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_publiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services_vitrine" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "categorie" TEXT NOT NULL DEFAULT 'diagnostic',
    "points_json" JSONB NOT NULL DEFAULT '[]',
    "badge" TEXT,
    "href" TEXT,
    "icone" TEXT NOT NULL DEFAULT 'laboratoire',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_vitrine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medecins_vitrine" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "horaires" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medecins_vitrine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medias_galerie" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "legende" TEXT,
    "album" TEXT NOT NULL DEFAULT 'general',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medias_galerie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_contact" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campagnes_publiques_slug_key" ON "campagnes_publiques"("slug");
CREATE INDEX "campagnes_publiques_publie_date_debut_date_fin_idx" ON "campagnes_publiques"("publie", "date_debut", "date_fin");
CREATE INDEX "campagnes_publiques_type_publication_publie_idx" ON "campagnes_publiques"("type_publication", "publie");
CREATE INDEX "campagnes_publiques_mis_en_avant_publie_idx" ON "campagnes_publiques"("mis_en_avant", "publie");

CREATE INDEX "diapositives_hero_actif_ordre_idx" ON "diapositives_hero"("actif", "ordre");

CREATE UNIQUE INDEX "pages_publiques_cle_key" ON "pages_publiques"("cle");

CREATE UNIQUE INDEX "services_vitrine_slug_key" ON "services_vitrine"("slug");
CREATE INDEX "services_vitrine_actif_ordre_idx" ON "services_vitrine"("actif", "ordre");

CREATE INDEX "medecins_vitrine_actif_ordre_idx" ON "medecins_vitrine"("actif", "ordre");

CREATE INDEX "medias_galerie_album_actif_ordre_idx" ON "medias_galerie"("album", "actif", "ordre");

CREATE INDEX "messages_contact_lu_created_at_idx" ON "messages_contact"("lu", "created_at");
