-- Messagerie & Notifications — extension complète SIGH

CREATE TYPE "CategorieGroupe" AS ENUM ('GENERAL', 'URGENCES', 'BLOC_OPERATOIRE', 'HOSPITALISATION', 'ADMINISTRATION', 'DIRECTION_MEDICALE', 'INTER_SERVICES');
ALTER TYPE "TypeConversation" ADD VALUE IF NOT EXISTS 'DIFFUSION';
ALTER TYPE "TypeMessage" ADD VALUE IF NOT EXISTS 'FICHIER';
ALTER TYPE "TypeMessage" ADD VALUE IF NOT EXISTS 'IMAGE';
ALTER TYPE "TypeMessage" ADD VALUE IF NOT EXISTS 'AUDIO';

CREATE TYPE "StatutPresence" AS ENUM ('EN_LIGNE', 'HORS_LIGNE', 'OCCUPE', 'EN_CONSULTATION', 'EN_LABORATOIRE', 'ABSENT');
CREATE TYPE "TypeNotification" AS ENUM ('NOUVEAU_PATIENT', 'PATIENT_TRANSFERE', 'PATIENT_EN_ATTENTE', 'CONSULTATION_TERMINEE', 'PATIENT_A_CONSULTER', 'RESULTATS_LABO', 'PATIENT_A_FACTURER', 'PAIEMENT_VALIDE', 'EXAMENS_AUTORISES', 'NOUVEL_EXAMEN', 'RESULTAT_VALIDE', 'ORDONNANCE_PRETE', 'PAIEMENT_PHARMACIE', 'NOUVELLE_ADMISSION', 'DEMANDE_TRANSFERT', 'SORTIE_PATIENT', 'NOUVEL_UTILISATEUR', 'SAUVEGARDE', 'RAPPORT', 'NOUVEAU_MESSAGE', 'NOUVEAU_GROUPE', 'MENTION', 'DIFFUSION');
CREATE TYPE "CanalNotification" AS ENUM ('IN_APP', 'TABLEAU_BORD', 'PUSH', 'EMAIL', 'SMS');
CREATE TYPE "TypePieceJointe" AS ENUM ('PDF', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'AUTRE');
CREATE TYPE "EmojiReaction" AS ENUM ('POUCES', 'COEUR', 'CHECK', 'EPINGLE', 'RIRE', 'SURPRISE');

ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "categorie_groupe" "CategorieGroupe";
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "patient_id" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "dossier_id" TEXT;

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "message_parent_id" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "transfere_de_id" TEXT;

CREATE TABLE IF NOT EXISTS "pieces_jointes" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypePieceJointe" NOT NULL DEFAULT 'DOCUMENT',
    "mime_type" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "bucket" TEXT,
    "cle_stockage" TEXT,
    "envoye_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pieces_jointes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reactions_messages" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "emoji" "EmojiReaction" NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reactions_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mentions_messages" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "destinataire_id" TEXT NOT NULL,
    CONSTRAINT "mentions_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "presences_utilisateurs" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "statut" "StatutPresence" NOT NULL DEFAULT 'HORS_LIGNE',
    "message_statut" TEXT,
    "dernier_ping" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "presences_utilisateurs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "canal" "CanalNotification" NOT NULL DEFAULT 'IN_APP',
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "module" "CodeSalle",
    "entite" TEXT,
    "entite_id" TEXT,
    "lien" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "archivee" BOOLEAN NOT NULL DEFAULT false,
    "metadonnees" JSONB,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu_le" TIMESTAMP(3),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "preferences_notifications" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "in_app" BOOLEAN NOT NULL DEFAULT true,
    "tableau_bord" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "silencieux" BOOLEAN NOT NULL DEFAULT false,
    "types_silencieux" "TypeNotification"[] DEFAULT ARRAY[]::"TypeNotification"[],
    CONSTRAINT "preferences_notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reactions_messages_message_id_utilisateur_id_emoji_key" ON "reactions_messages"("message_id", "utilisateur_id", "emoji");
CREATE UNIQUE INDEX IF NOT EXISTS "mentions_messages_message_id_destinataire_id_key" ON "mentions_messages"("message_id", "destinataire_id");
CREATE UNIQUE INDEX IF NOT EXISTS "presences_utilisateurs_utilisateur_id_key" ON "presences_utilisateurs"("utilisateur_id");
CREATE UNIQUE INDEX IF NOT EXISTS "preferences_notifications_utilisateur_id_key" ON "preferences_notifications"("utilisateur_id");
CREATE INDEX IF NOT EXISTS "notifications_utilisateur_id_lu_cree_le_idx" ON "notifications"("utilisateur_id", "lu", "cree_le");
CREATE INDEX IF NOT EXISTS "conversations_patient_id_idx" ON "conversations"("patient_id");
CREATE INDEX IF NOT EXISTS "conversations_dossier_id_idx" ON "conversations"("dossier_id");
CREATE INDEX IF NOT EXISTS "messages_message_parent_id_idx" ON "messages"("message_parent_id");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_message_parent_id_fkey" FOREIGN KEY ("message_parent_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reactions_messages" ADD CONSTRAINT "reactions_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reactions_messages" ADD CONSTRAINT "reactions_messages_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentions_messages" ADD CONSTRAINT "mentions_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentions_messages" ADD CONSTRAINT "mentions_messages_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "presences_utilisateurs" ADD CONSTRAINT "presences_utilisateurs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "preferences_notifications" ADD CONSTRAINT "preferences_notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
