-- Photo patient (réception)
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "photo_url" TEXT;
