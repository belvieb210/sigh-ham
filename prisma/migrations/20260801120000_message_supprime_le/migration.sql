-- Horodatage de suppression + retrait des placeholders expirés (> 1 h)
ALTER TABLE "messages" ADD COLUMN "supprime_le" TIMESTAMP(3);

UPDATE "messages"
SET "supprime_le" = "envoye_le"
WHERE "supprime" = true AND "supprime_le" IS NULL;
