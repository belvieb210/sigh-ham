-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CodeSalle" AS ENUM ('RECEPTION', 'INFIRMIERS', 'MEDECINS', 'CAISSE', 'LABORATOIRE', 'PHARMACIE', 'EGLISE', 'MEDECINS_EXTERNES', 'HOSPITALISATION', 'ADMIN', 'MESSAGERIE');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('MASCULIN', 'FEMININ', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutDossier" AS ENUM ('OUVERT', 'EN_COURS', 'CLOTURE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "StatutPassage" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutTransfert" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'EN_TRAITEMENT', 'TERMINE', 'REFUSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "PrioriteFile" AS ENUM ('NORMALE', 'URGENTE', 'TRES_URGENTE');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('BROUILLON', 'EMISE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'CARTE', 'VIREMENT', 'CHEQUE');

-- CreateEnum
CREATE TYPE "StatutExamen" AS ENUM ('PRESCRIT', 'PRELEVE', 'EN_ANALYSE', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutOrdonnance" AS ENUM ('EN_ATTENTE', 'PARTIELLEMENT_DELIVREE', 'DELIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutAdmission" AS ENUM ('ADMIS', 'EN_SOINS', 'SORTI', 'TRANSFERE', 'DECEDE');

-- CreateEnum
CREATE TYPE "TypeAudit" AS ENUM ('CONNEXION', 'DECONNEXION', 'CREATION', 'MODIFICATION', 'SUPPRESSION', 'TRANSFERT', 'CONSULTATION', 'EXPORT');

-- CreateEnum
CREATE TYPE "StatutRendezVous" AS ENUM ('DEMANDE', 'CONFIRME', 'ANNULE', 'TERMINE', 'ABSENT');

-- CreateEnum
CREATE TYPE "StatutExamenPrenuptial" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateTable
CREATE TABLE "salles" (
    "id" TEXT NOT NULL,
    "code" "CodeSalle" NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "salle_id" TEXT,
    "systeme" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "module" "CodeSalle",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "roles_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "email" TEXT,
    "mot_de_passe_hash" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'ACTIF',
    "role_id" TEXT NOT NULL,
    "medecin_externe_id" TEXT,
    "derniere_connexion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expire_le" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "numero_patient" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3),
    "sexe" "Sexe",
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "province" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'RD Congo',
    "groupe_sanguin" TEXT,
    "allergies" TEXT,
    "contact_urgence" TEXT,
    "telephone_urgence" TEXT,
    "medecin_externe_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers_patients" (
    "id" TEXT NOT NULL,
    "numero_dossier" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "statut" "StatutDossier" NOT NULL DEFAULT 'OUVERT',
    "motif_ouverture" TEXT,
    "ouvert_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cloture_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossiers_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passages" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "statut" "StatutPassage" NOT NULL DEFAULT 'EN_ATTENTE',
    "priorite" "PrioriteFile" NOT NULL DEFAULT 'NORMALE',
    "motif" TEXT,
    "debut_le" TIMESTAMP(3),
    "fin_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferts" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "passage_id" TEXT,
    "salle_origine_id" TEXT NOT NULL,
    "salle_destination_id" TEXT NOT NULL,
    "statut" "StatutTransfert" NOT NULL DEFAULT 'EN_ATTENTE',
    "priorite" "PrioriteFile" NOT NULL DEFAULT 'NORMALE',
    "motif" TEXT,
    "notes" TEXT,
    "emetteur_id" TEXT NOT NULL,
    "recepteur_id" TEXT,
    "emis_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepte_le" TIMESTAMP(3),
    "termine_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files_attente" (
    "id" TEXT NOT NULL,
    "salle_id" TEXT NOT NULL,
    "passage_id" TEXT NOT NULL,
    "numero_ordre" INTEGER NOT NULL,
    "priorite" "PrioriteFile" NOT NULL DEFAULT 'NORMALE',
    "arrive_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appele_le" TIMESTAMP(3),
    "servi_le" TIMESTAMP(3),

    CONSTRAINT "files_attente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enregistrements_reception" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "type_visite" TEXT NOT NULL,
    "assurance" TEXT,
    "numero_assurance" TEXT,
    "observations" TEXT,
    "enregistre_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enregistrements_reception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constantes_vitales" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "infirmier_id" TEXT NOT NULL,
    "temperature" DECIMAL(4,1),
    "tension_systolique" INTEGER,
    "tension_diastolique" INTEGER,
    "frequence_cardiaque" INTEGER,
    "frequence_respiratoire" INTEGER,
    "poids_kg" DECIMAL(5,2),
    "taille_cm" DECIMAL(5,1),
    "saturation_o2" INTEGER,
    "glycemie" DECIMAL(5,2),
    "observations" TEXT,
    "mesure_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "constantes_vitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "medecin_id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "anamnese" TEXT,
    "examen_clinique" TEXT,
    "conclusion" TEXT,
    "debut_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin_le" TIMESTAMP(3),

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostics" (
    "id" TEXT NOT NULL,
    "consultation_id" TEXT NOT NULL,
    "code_cim" TEXT,
    "libelle" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions_actes" (
    "id" TEXT NOT NULL,
    "consultation_id" TEXT NOT NULL,
    "type_acte" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "prescriptions_actes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "numero_facture" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'BROUILLON',
    "montant_total" DECIMAL(12,2) NOT NULL,
    "montant_paye" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'CDF',
    "emise_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_facture" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prix_unitaire" DECIMAL(12,2) NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "mode" "ModePaiement" NOT NULL,
    "reference" TEXT,
    "caissier_id" TEXT NOT NULL,
    "paye_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_examen" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "prix" DECIMAL(12,2) NOT NULL,
    "delai_heures" INTEGER NOT NULL DEFAULT 24,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "types_examen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examens_laboratoire" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "type_examen_id" TEXT NOT NULL,
    "prescripteur_id" TEXT NOT NULL,
    "technicien_id" TEXT,
    "statut" "StatutExamen" NOT NULL DEFAULT 'PRESCRIT',
    "preleve_le" TIMESTAMP(3),
    "resultat_le" TIMESTAMP(3),
    "rapport_pdf_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examens_laboratoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_examen" (
    "id" TEXT NOT NULL,
    "examen_id" TEXT NOT NULL,
    "parametre" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "unite" TEXT,
    "norme_min" TEXT,
    "norme_max" TEXT,
    "anormal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "resultats_examen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicaments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "forme" TEXT,
    "dosage" TEXT,
    "prix_unitaire" DECIMAL(12,2) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "medicaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks_medicaments" (
    "id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "seuil_alerte" INTEGER NOT NULL DEFAULT 10,
    "lot" TEXT,
    "expiration_le" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_medicaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordonnances" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "medecin_id" TEXT NOT NULL,
    "statut" "StatutOrdonnance" NOT NULL DEFAULT 'EN_ATTENTE',
    "prescrit_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ordonnances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_ordonnance" (
    "id" TEXT NOT NULL,
    "ordonnance_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "posologie" TEXT,
    "duree_jours" INTEGER,

    CONSTRAINT "lignes_ordonnance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivrances_pharmacie" (
    "id" TEXT NOT NULL,
    "ordonnance_id" TEXT NOT NULL,
    "delivre_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "delivrances_pharmacie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examens_prenuptiaux" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "statut" "StatutExamenPrenuptial" NOT NULL DEFAULT 'PLANIFIE',
    "date_mariage" TIMESTAMP(3),
    "paroisse" TEXT,
    "resultat" TEXT,
    "certificat_url" TEXT,
    "planifie_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termine_le" TIMESTAMP(3),

    CONSTRAINT "examens_prenuptiaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medecins_externes" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "specialite" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "numero_ordre" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medecins_externes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chambres" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL DEFAULT 1,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chambres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lits" (
    "id" TEXT NOT NULL,
    "chambre_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "occupe" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "chambre_id" TEXT,
    "lit_id" TEXT,
    "statut" "StatutAdmission" NOT NULL DEFAULT 'ADMIS',
    "motif" TEXT NOT NULL,
    "admis_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sorti_le" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_rendez_vous" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "service" TEXT NOT NULL,
    "motif" TEXT,
    "date_souhaitee" TIMESTAMP(3) NOT NULL,
    "statut" "StatutRendezVous" NOT NULL DEFAULT 'DEMANDE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "sujet" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "expediteur_id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "envoye_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT,
    "type" "TypeAudit" NOT NULL,
    "module" "CodeSalle",
    "entite" TEXT NOT NULL,
    "entite_id" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salles_code_key" ON "salles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_identifiant_key" ON "utilisateurs"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_medecin_externe_id_key" ON "utilisateurs"("medecin_externe_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "patients_numero_patient_key" ON "patients"("numero_patient");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_patients_numero_dossier_key" ON "dossiers_patients"("numero_dossier");

-- CreateIndex
CREATE INDEX "transferts_salle_destination_id_statut_idx" ON "transferts"("salle_destination_id", "statut");

-- CreateIndex
CREATE INDEX "transferts_dossier_id_idx" ON "transferts"("dossier_id");

-- CreateIndex
CREATE UNIQUE INDEX "files_attente_passage_id_key" ON "files_attente"("passage_id");

-- CreateIndex
CREATE INDEX "files_attente_salle_id_numero_ordre_idx" ON "files_attente"("salle_id", "numero_ordre");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_facture_key" ON "factures"("numero_facture");

-- CreateIndex
CREATE UNIQUE INDEX "types_examen_code_key" ON "types_examen"("code");

-- CreateIndex
CREATE UNIQUE INDEX "medicaments_code_key" ON "medicaments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "chambres_numero_key" ON "chambres"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "lits_chambre_id_numero_key" ON "lits"("chambre_id", "numero");

-- CreateIndex
CREATE INDEX "journal_audit_utilisateur_id_created_at_idx" ON "journal_audit"("utilisateur_id", "created_at");

-- CreateIndex
CREATE INDEX "journal_audit_module_created_at_idx" ON "journal_audit"("module", "created_at");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "salles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_medecin_externe_id_fkey" FOREIGN KEY ("medecin_externe_id") REFERENCES "medecins_externes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_medecin_externe_id_fkey" FOREIGN KEY ("medecin_externe_id") REFERENCES "medecins_externes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers_patients" ADD CONSTRAINT "dossiers_patients_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_salle_origine_id_fkey" FOREIGN KEY ("salle_origine_id") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_salle_destination_id_fkey" FOREIGN KEY ("salle_destination_id") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_emetteur_id_fkey" FOREIGN KEY ("emetteur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_recepteur_id_fkey" FOREIGN KEY ("recepteur_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files_attente" ADD CONSTRAINT "files_attente_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files_attente" ADD CONSTRAINT "files_attente_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enregistrements_reception" ADD CONSTRAINT "enregistrements_reception_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enregistrements_reception" ADD CONSTRAINT "enregistrements_reception_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constantes_vitales" ADD CONSTRAINT "constantes_vitales_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constantes_vitales" ADD CONSTRAINT "constantes_vitales_infirmier_id_fkey" FOREIGN KEY ("infirmier_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_medecin_id_fkey" FOREIGN KEY ("medecin_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions_actes" ADD CONSTRAINT "prescriptions_actes_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_facture" ADD CONSTRAINT "lignes_facture_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_caissier_id_fkey" FOREIGN KEY ("caissier_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_laboratoire" ADD CONSTRAINT "examens_laboratoire_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_laboratoire" ADD CONSTRAINT "examens_laboratoire_type_examen_id_fkey" FOREIGN KEY ("type_examen_id") REFERENCES "types_examen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_laboratoire" ADD CONSTRAINT "examens_laboratoire_prescripteur_id_fkey" FOREIGN KEY ("prescripteur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_laboratoire" ADD CONSTRAINT "examens_laboratoire_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_examen" ADD CONSTRAINT "resultats_examen_examen_id_fkey" FOREIGN KEY ("examen_id") REFERENCES "examens_laboratoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_medicaments" ADD CONSTRAINT "stocks_medicaments_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_medecin_id_fkey" FOREIGN KEY ("medecin_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ordonnance" ADD CONSTRAINT "lignes_ordonnance_ordonnance_id_fkey" FOREIGN KEY ("ordonnance_id") REFERENCES "ordonnances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ordonnance" ADD CONSTRAINT "lignes_ordonnance_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivrances_pharmacie" ADD CONSTRAINT "delivrances_pharmacie_ordonnance_id_fkey" FOREIGN KEY ("ordonnance_id") REFERENCES "ordonnances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens_prenuptiaux" ADD CONSTRAINT "examens_prenuptiaux_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lits" ADD CONSTRAINT "lits_chambre_id_fkey" FOREIGN KEY ("chambre_id") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_chambre_id_fkey" FOREIGN KEY ("chambre_id") REFERENCES "chambres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_lit_id_fkey" FOREIGN KEY ("lit_id") REFERENCES "lits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_expediteur_id_fkey" FOREIGN KEY ("expediteur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
