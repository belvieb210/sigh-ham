-- AlterTable
ALTER TABLE "preferences_notifications" ADD COLUMN IF NOT EXISTS "son" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "abonnements_push" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonnements_push_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "abonnements_push_endpoint_key" ON "abonnements_push"("endpoint");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "abonnements_push_utilisateur_id_idx" ON "abonnements_push"("utilisateur_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "abonnements_push" ADD CONSTRAINT "abonnements_push_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
