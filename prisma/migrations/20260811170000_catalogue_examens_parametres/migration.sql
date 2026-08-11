-- Catalogue examens laboratoire : métadonnées étendues + paramètres par type d'examen

ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "formulaire" TEXT;
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "service_labo" TEXT;
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "specimen" TEXT;
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "unite_defaut" TEXT;
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "range_usuelle" TEXT;
ALTER TABLE "types_examen" ADD COLUMN IF NOT EXISTS "description" TEXT;

CREATE TABLE IF NOT EXISTS "parametres_type_examen" (
    "id" TEXT NOT NULL,
    "type_examen_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "unite" TEXT,
    "range_usuelle" TEXT,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parametres_type_examen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "parametres_type_examen_type_examen_id_nom_key"
    ON "parametres_type_examen"("type_examen_id", "nom");

ALTER TABLE "parametres_type_examen"
    ADD CONSTRAINT "parametres_type_examen_type_examen_id_fkey"
    FOREIGN KEY ("type_examen_id") REFERENCES "types_examen"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "resultats_examen" ADD COLUMN IF NOT EXISTS "parametre_type_examen_id" TEXT;
ALTER TABLE "resultats_examen" ADD COLUMN IF NOT EXISTS "non_requis" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "resultats_examen"
    ADD CONSTRAINT "resultats_examen_parametre_type_examen_id_fkey"
    FOREIGN KEY ("parametre_type_examen_id") REFERENCES "parametres_type_examen"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "resultats_examen_examen_id_parametre_type_examen_id_key"
    ON "resultats_examen"("examen_id", "parametre_type_examen_id");
