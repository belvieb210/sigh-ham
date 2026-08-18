-- Gouvernance patient : trace durable des actions (résultats, transferts, reset)
-- visible aussi dans journal_audit via journal_audit_id.

CREATE TYPE "TypeOperationGouvernancePatient" AS ENUM (
  'CONSULTATION_RESULTATS',
  'ANNULATION_TRANSFERT',
  'RESTAURATION_TRANSFERT',
  'REINITIALISATION_VISITE'
);

CREATE TABLE "operations_gouvernance_patient" (
  "id" TEXT NOT NULL,
  "type" "TypeOperationGouvernancePatient" NOT NULL,
  "patient_id" TEXT NOT NULL,
  "numero_patient" TEXT NOT NULL,
  "dossier_id" TEXT,
  "numero_dossier" TEXT,
  "utilisateur_id" TEXT NOT NULL,
  "journal_audit_id" TEXT,
  "action" TEXT NOT NULL,
  "snapshot" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "operations_gouvernance_patient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "operations_gouvernance_patient_journal_audit_id_key"
  ON "operations_gouvernance_patient"("journal_audit_id");

CREATE INDEX "operations_gouvernance_patient_patient_id_created_at_idx"
  ON "operations_gouvernance_patient"("patient_id", "created_at");

CREATE INDEX "operations_gouvernance_patient_type_created_at_idx"
  ON "operations_gouvernance_patient"("type", "created_at");

ALTER TABLE "operations_gouvernance_patient"
  ADD CONSTRAINT "operations_gouvernance_patient_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "operations_gouvernance_patient"
  ADD CONSTRAINT "operations_gouvernance_patient_utilisateur_id_fkey"
  FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "operations_gouvernance_patient"
  ADD CONSTRAINT "operations_gouvernance_patient_journal_audit_id_fkey"
  FOREIGN KEY ("journal_audit_id") REFERENCES "journal_audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
