-- CreateTable
CREATE TABLE "messages_masques" (
    "message_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "masque_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_masques_pkey" PRIMARY KEY ("message_id","utilisateur_id")
);

-- AddForeignKey
ALTER TABLE "messages_masques" ADD CONSTRAINT "messages_masques_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_masques" ADD CONSTRAINT "messages_masques_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
