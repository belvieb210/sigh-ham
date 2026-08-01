-- Messagerie entreprise SIGH — canaux, participants, accusés de lecture

CREATE TYPE "TypeConversation" AS ENUM ('DIRECT', 'GROUPE', 'CANAL_SALLE');
CREATE TYPE "RoleParticipant" AS ENUM ('ADMIN', 'MEMBRE');
CREATE TYPE "PrioriteMessage" AS ENUM ('NORMALE', 'URGENTE', 'CRITIQUE');
CREATE TYPE "TypeMessage" AS ENUM ('TEXTE', 'SYSTEME', 'LIEN_PATIENT', 'LIEN_TRANSFERT');

ALTER TABLE "conversations" ADD COLUMN "type" "TypeConversation" NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "conversations" ADD COLUMN "salle_code" "CodeSalle";
ALTER TABLE "conversations" ADD COLUMN "epingle" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "conversations" ADD COLUMN "archivee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "conversations" ADD COLUMN "createur_id" TEXT;

ALTER TABLE "messages" ADD COLUMN "type" "TypeMessage" NOT NULL DEFAULT 'TEXTE';
ALTER TABLE "messages" ADD COLUMN "priorite" "PrioriteMessage" NOT NULL DEFAULT 'NORMALE';
ALTER TABLE "messages" ADD COLUMN "metadonnees" JSONB;
ALTER TABLE "messages" ADD COLUMN "modifie_le" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN "supprime" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "messages" DROP COLUMN "lu";

CREATE TABLE "participants_conversations" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "role" "RoleParticipant" NOT NULL DEFAULT 'MEMBRE',
    "silencieux" BOOLEAN NOT NULL DEFAULT false,
    "epingle_perso" BOOLEAN NOT NULL DEFAULT false,
    "dernier_lu_le" TIMESTAMP(3),
    "rejoint_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages_lus" (
    "message_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "lu_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_lus_pkey" PRIMARY KEY ("message_id","utilisateur_id")
);

CREATE UNIQUE INDEX "participants_conversations_conversation_id_utilisateur_id_key" ON "participants_conversations"("conversation_id", "utilisateur_id");
CREATE INDEX "participants_conversations_utilisateur_id_idx" ON "participants_conversations"("utilisateur_id");
CREATE INDEX "conversations_type_salle_code_idx" ON "conversations"("type", "salle_code");
CREATE INDEX "conversations_updated_at_idx" ON "conversations"("updated_at");
CREATE INDEX "messages_conversation_id_envoye_le_idx" ON "messages"("conversation_id", "envoye_le");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "participants_conversations" ADD CONSTRAINT "participants_conversations_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "participants_conversations" ADD CONSTRAINT "participants_conversations_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages_lus" ADD CONSTRAINT "messages_lus_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages_lus" ADD CONSTRAINT "messages_lus_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
