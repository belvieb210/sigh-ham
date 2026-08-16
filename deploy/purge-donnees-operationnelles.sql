-- =============================================================================
-- SIGH HAM — Purge des données opérationnelles (patients, factures, flux cliniques)
--
-- CONSERVE :
--   utilisateurs, roles, permissions, salles
--   medicaments, stocks, lots, fournisseurs, achats pharmacie (réappro)
--   catalogue examens (types_examen, paquets_bilans, parametres_type_examen)
--   chambres, lits, medecins_externes (référentiel)
--   paramètres système, vitrine publique (campagnes, pages, etc.)
--   messagerie interne (conversations sans patient/dossier)
--
-- SUPPRIME :
--   patients, dossiers, passages, transferts, files d'attente
--   factures, paiements, sessions caisse
--   examens labo réalisés + resultats_examen (toutes les lignes de résultats)
--   consultations, ordonnances, ventes pharmacie
--   demandes RDV site public, messages contact
--   notifications, journal audit, sessions connexion
--
-- Usage : via deploy/purge-donnees-operationnelles.sh (jamais direct en prod sans backup)
-- =============================================================================

BEGIN;

-- ── Compteurs avant ───────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== AVANT PURGE ===';
  FOR r IN
    SELECT 'patients' AS t, COUNT(*)::bigint AS n FROM patients
    UNION ALL SELECT 'dossiers_patients', COUNT(*) FROM dossiers_patients
    UNION ALL SELECT 'factures', COUNT(*) FROM factures
    UNION ALL SELECT 'paiements', COUNT(*) FROM paiements
    UNION ALL SELECT 'examens_laboratoire', COUNT(*) FROM examens_laboratoire
    UNION ALL SELECT 'resultats_examen', COUNT(*) FROM resultats_examen
    UNION ALL SELECT 'medicaments', COUNT(*) FROM medicaments
    UNION ALL SELECT 'types_examen', COUNT(*) FROM types_examen
    UNION ALL SELECT 'utilisateurs', COUNT(*) FROM utilisateurs
  LOOP
    RAISE NOTICE '% : %', r.t, r.n;
  END LOOP;
END $$;

-- ── Messagerie liée aux patients ──────────────────────────────────────────────
DELETE FROM conversations
WHERE patient_id IS NOT NULL OR dossier_id IS NOT NULL;

-- ── Notifications & audit opérationnel ────────────────────────────────────────
DELETE FROM notifications;
DELETE FROM journal_audit;
DELETE FROM sessions;

-- ── Site public (demandes clients) ────────────────────────────────────────────
DELETE FROM messages_contact;
DELETE FROM demandes_rendez_vous;

-- ── Pharmacie — transactions patients (garde le catalogue + stocks + achats) ─
DELETE FROM lignes_retour_pharmacie;
DELETE FROM retours_pharmacie;
DELETE FROM lignes_delivrance_pharmacie;
DELETE FROM delivrances_pharmacie;
DELETE FROM lignes_vente_pharmacie;
DELETE FROM ventes_pharmacie;
DELETE FROM lignes_ordonnance;
DELETE FROM ordonnances;
DELETE FROM mouvements_stock;

-- ── Caisse ────────────────────────────────────────────────────────────────────
DELETE FROM paiements;
DELETE FROM lignes_facture;
DELETE FROM factures;
DELETE FROM sessions_caisse;

-- ── Laboratoire — examens réalisés + table resultats_examen (vide complète) ───
-- Ordre : resultats_examen d'abord (FK vers examens_laboratoire), puis examens.
DELETE FROM resultats_examen;
DELETE FROM examens_laboratoire;

-- ── Église / estimations ────────────────────────────────────────────────────────
DELETE FROM estimation_convention_lignes;
DELETE FROM estimations_convention;
DELETE FROM examens_prenuptiaux;

-- ── Infirmiers ────────────────────────────────────────────────────────────────
DELETE FROM commentaires_traitement;
DELETE FROM fichiers_traitement;
DELETE FROM lignes_traitement;
DELETE FROM fiches_traitement;

-- ── Médecins ──────────────────────────────────────────────────────────────────
DELETE FROM diagnostics;
DELETE FROM prescriptions_actes;
DELETE FROM consultations;

-- ── Réception ─────────────────────────────────────────────────────────────────
DELETE FROM constantes_vitales;
DELETE FROM enregistrements_reception;

-- ── Transferts & files ────────────────────────────────────────────────────────
DELETE FROM transferts_recuperation;
DELETE FROM transferts;
DELETE FROM files_attente;
DELETE FROM passages;

-- ── Hospitalisation ───────────────────────────────────────────────────────────
DELETE FROM admissions;
UPDATE lits SET occupe = false;

-- ── Patients & dossiers ───────────────────────────────────────────────────────
DELETE FROM dossiers_patients;
DELETE FROM patients;

-- ── Compteurs après ───────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== APRES PURGE ===';
  FOR r IN
    SELECT 'patients' AS t, COUNT(*)::bigint AS n FROM patients
    UNION ALL SELECT 'dossiers_patients', COUNT(*) FROM dossiers_patients
    UNION ALL SELECT 'factures', COUNT(*) FROM factures
    UNION ALL SELECT 'paiements', COUNT(*) FROM paiements
    UNION ALL SELECT 'examens_laboratoire', COUNT(*) FROM examens_laboratoire
    UNION ALL SELECT 'resultats_examen', COUNT(*) FROM resultats_examen
    UNION ALL SELECT 'medicaments', COUNT(*) FROM medicaments
    UNION ALL SELECT 'types_examen', COUNT(*) FROM types_examen
    UNION ALL SELECT 'utilisateurs', COUNT(*) FROM utilisateurs
  LOOP
    RAISE NOTICE '% : %', r.t, r.n;
  END LOOP;
END $$;

COMMIT;
