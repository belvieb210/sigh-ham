#!/usr/bin/env bash
# Corrige le mojibake UTF-8 (ex. MÃ©decins → Médecins) après import Windows → Linux
# Usage (root) : bash /var/www/sigh-ham/deploy/fix-encodage-utf8.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"

# shellcheck source=lib/database-url.sh
source "${APP_DIR}/deploy/lib/database-url.sh"
charger_database_url "${APP_DIR}"
PG_URL=$(url_pour_pg_tools "${DATABASE_URL}")

echo "==> Correction encodage (LATIN1 mal interprété → UTF-8)"

psql "${PG_URL}" -v ON_ERROR_STOP=1 <<'SQL'
-- Fonction : répare une chaîne doublement encodée (UTF-8 lu comme Latin1)
CREATE OR REPLACE FUNCTION sigh_fix_mojibake(t text) RETURNS text AS $$
BEGIN
  IF t IS NULL OR t !~ 'Ã' THEN
    RETURN t;
  END IF;
  BEGIN
    RETURN convert_from(convert_to(t, 'LATIN1'), 'UTF8');
  EXCEPTION WHEN others THEN
    RETURN t;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Salles & rôles (libellés FR)
UPDATE salles SET nom = sigh_fix_mojibake(nom) WHERE nom ~ 'Ã';
UPDATE roles SET nom = sigh_fix_mojibake(nom) WHERE nom ~ 'Ã';

-- Patients / dossiers / réception
UPDATE patients SET
  prenom = sigh_fix_mojibake(prenom),
  nom = sigh_fix_mojibake(nom),
  adresse = sigh_fix_mojibake(adresse),
  ville = sigh_fix_mojibake(ville),
  province = sigh_fix_mojibake(province),
  allergies = sigh_fix_mojibake(allergies),
  contact_urgence = sigh_fix_mojibake(contact_urgence)
WHERE prenom ~ 'Ã' OR nom ~ 'Ã' OR coalesce(adresse,'') ~ 'Ã'
   OR coalesce(ville,'') ~ 'Ã' OR coalesce(province,'') ~ 'Ã'
   OR coalesce(allergies,'') ~ 'Ã' OR coalesce(contact_urgence,'') ~ 'Ã';

UPDATE dossiers_patients SET
  motif_ouverture = sigh_fix_mojibake(motif_ouverture)
WHERE coalesce(motif_ouverture,'') ~ 'Ã';

UPDATE utilisateurs SET
  prenom = sigh_fix_mojibake(prenom),
  nom = sigh_fix_mojibake(nom)
WHERE prenom ~ 'Ã' OR nom ~ 'Ã';

UPDATE transferts SET
  motif = sigh_fix_mojibake(motif)
WHERE coalesce(motif,'') ~ 'Ã';

-- Vérification
SELECT code, nom FROM salles ORDER BY ordre;
SQL

echo ""
echo "==> Reseed libellés officiels (salles / rôles)"
cd "${APP_DIR}"
if [[ "${EUID:-0}" -eq 0 ]]; then
  sudo -u sigh npm run db:seed
else
  npm run db:seed
fi

echo ""
echo "✅ Encodage corrigé — rechargez la page (Ctrl+Shift+R)"
