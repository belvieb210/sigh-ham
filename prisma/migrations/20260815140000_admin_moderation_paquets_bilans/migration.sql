-- Admin: paquets bilans, modération messagerie, accès utilisateurs

ALTER TABLE "utilisateurs" ADD COLUMN IF NOT EXISTS "messagerie_bloquee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "utilisateurs" ADD COLUMN IF NOT EXISTS "notes_admin" TEXT;

ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "bloquee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "bloquee_le" TIMESTAMP(3);
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "bloquee_par_id" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "bloquee_raison" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "supprimee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "supprimee_le" TIMESTAMP(3);
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "supprimee_par_id" TEXT;

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "contenu_archive" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "bloque" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "bloque_le" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "bloque_par_id" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "bloque_raison" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "signale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "signale_raison" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "avertissement_envoye" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "pieces_jointes" ADD COLUMN IF NOT EXISTS "supprimee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pieces_jointes" ADD COLUMN IF NOT EXISTS "supprimee_le" TIMESTAMP(3);
ALTER TABLE "pieces_jointes" ADD COLUMN IF NOT EXISTS "signalee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pieces_jointes" ADD COLUMN IF NOT EXISTS "signalee_raison" TEXT;

CREATE TABLE IF NOT EXISTS "paquets_bilans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(12,2) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paquets_bilans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "paquets_bilans_code_key" ON "paquets_bilans"("code");

CREATE TABLE IF NOT EXISTS "paquets_bilans_examens" (
    "id" TEXT NOT NULL,
    "paquet_bilan_id" TEXT NOT NULL,
    "type_examen_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "paquets_bilans_examens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "paquets_bilans_examens_paquet_bilan_id_type_examen_id_key"
  ON "paquets_bilans_examens"("paquet_bilan_id", "type_examen_id");
CREATE INDEX IF NOT EXISTS "paquets_bilans_examens_type_examen_id_idx"
  ON "paquets_bilans_examens"("type_examen_id");

ALTER TABLE "paquets_bilans_examens" DROP CONSTRAINT IF EXISTS "paquets_bilans_examens_paquet_bilan_id_fkey";
ALTER TABLE "paquets_bilans_examens" ADD CONSTRAINT "paquets_bilans_examens_paquet_bilan_id_fkey"
  FOREIGN KEY ("paquet_bilan_id") REFERENCES "paquets_bilans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "paquets_bilans_examens" DROP CONSTRAINT IF EXISTS "paquets_bilans_examens_type_examen_id_fkey";
ALTER TABLE "paquets_bilans_examens" ADD CONSTRAINT "paquets_bilans_examens_type_examen_id_fkey"
  FOREIGN KEY ("type_examen_id") REFERENCES "types_examen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "moderation_avertissements" (
    "id" TEXT NOT NULL,
    "destinataire_id" TEXT NOT NULL,
    "emetteur_id" TEXT NOT NULL,
    "message_id" TEXT,
    "conversation_id" TEXT,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_avertissements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "moderation_avertissements_destinataire_id_lu_idx"
  ON "moderation_avertissements"("destinataire_id", "lu");
CREATE INDEX IF NOT EXISTS "moderation_avertissements_cree_le_idx"
  ON "moderation_avertissements"("cree_le");

ALTER TABLE "moderation_avertissements" DROP CONSTRAINT IF EXISTS "moderation_avertissements_destinataire_id_fkey";
ALTER TABLE "moderation_avertissements" ADD CONSTRAINT "moderation_avertissements_destinataire_id_fkey"
  FOREIGN KEY ("destinataire_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moderation_avertissements" DROP CONSTRAINT IF EXISTS "moderation_avertissements_emetteur_id_fkey";
ALTER TABLE "moderation_avertissements" ADD CONSTRAINT "moderation_avertissements_emetteur_id_fkey"
  FOREIGN KEY ("emetteur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
