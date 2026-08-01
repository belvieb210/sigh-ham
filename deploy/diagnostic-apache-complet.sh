#!/usr/bin/env bash
# Audit complet des sites Apache — lecture seule (sauf --export)
# Usage (root) :
#   bash /var/www/sigh-ham/deploy/diagnostic-apache-complet.sh
#   bash /var/www/sigh-ham/deploy/diagnostic-apache-complet.sh --export > /root/apache-audit.txt
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
EXPORT=false
[[ "${1:-}" == "--export" ]] && EXPORT=true

log() {
  if [[ "$EXPORT" == true ]]; then
    echo "$@"
  else
    echo "$@"
  fi
}

erreur=0
avert=0

log "══════════════════════════════════════════════════════════════"
log "  AUDIT APACHE — $(date -Iseconds)"
log "══════════════════════════════════════════════════════════════"
log ""

log "── 1. Ports écoutés ──"
ss -tlnp | grep -E ':80|:443' || log "(aucun)"
log ""

log "── 2. VirtualHost (apache2ctl -S) ──"
apache2ctl -S 2>&1 || true
log ""

log "── 3. Sites activés ──"
ls -la /etc/apache2/sites-enabled/ 2>/dev/null || true
log ""

log "── 4. Analyse par fichier de config ──"
log ""

declare -A COMPTER_DOMAINES

for lien in /etc/apache2/sites-enabled/*; do
  [[ -L "$lien" || -f "$lien" ]] || continue
  fichier=$(readlink -f "$lien" 2>/dev/null || echo "$lien")
  nom=$(basename "$lien")
  [[ -f "$fichier" ]] || continue

  log "┌─ ${nom}"
  log "│  Fichier : ${fichier}"

  while IFS= read -r ligne; do
    if [[ "$ligne" =~ VirtualHost ]]; then
      port=$(echo "$ligne" | grep -oE '\*:[0-9]+' | cut -d: -f2 || echo "?")
      log "│  Port    : ${port}"
    fi
    if [[ "$ligne" =~ ServerName[[:space:]]+([^[:space:]]+) ]]; then
      sn="${BASH_REMATCH[1]}"
      log "│  Domaine : ${sn}"
      cle="${sn}:${port:-80}"
      COMPTER_DOMAINES[$cle]=$((${COMPTER_DOMAINES[$cle]:-0} + 1))
    fi
    if [[ "$ligne" =~ DocumentRoot[[:space:]]+([^[:space:]]+) ]]; then
      dr="${BASH_REMATCH[1]}"
      log "│  Racine  : ${dr}"
      if [[ ! -d "$dr" ]]; then
        log "│  ❌ ERREUR : dossier inexistant"
        ((erreur++)) || true
      elif [[ ! -f "${dr}/index.php" && ! -f "${dr}/index.html" ]]; then
        log "│  ⚠ AVERT  : pas de index.php/html"
        ((avert++)) || true
        # Suggérer correction
        parent=$(dirname "$dr")
        if [[ -f "${parent}/index.php" ]]; then
          log "│  💡 Suggestion : DocumentRoot → ${parent}"
        fi
      else
        log "│  ✓ index présent"
      fi
    fi
    if [[ "$ligne" =~ ProxyPass[[:space:]]+http ]]; then
      log "│  Proxy   : ${ligne// / }"
    fi
  done < "$fichier"

  # SSL certificat si HTTPS
  if grep -q '<VirtualHost \*:443' "$fichier" 2>/dev/null || grep -q 'SSLEngine on' "$fichier" 2>/dev/null; then
    cert=$(grep -E 'SSLCertificateFile|CertificateFile' "$fichier" 2>/dev/null | head -1 | awk '{print $2}' || true)
    if [[ -n "$cert" && -f "$cert" ]]; then
      cn=$(openssl x509 -in "$cert" -noout -subject 2>/dev/null | sed 's/.*CN *= *//' || true)
      log "│  Cert CN : ${cn}"
      sn_fichier=$(grep -m1 'ServerName' "$fichier" | awk '{print $2}' || true)
      if [[ -n "$sn_fichier" && -n "$cn" && "$cn" != *"$sn_fichier"* && "$sn_fichier" != *"${cn%%.*}"* ]]; then
        log "│  ⚠ AVERT  : certificat ne correspond peut-être pas au domaine"
        ((avert++)) || true
      fi
    fi
  fi

  log "└─"
  log ""
done

log "── 5. Doublons (même domaine + port) ──"
dup=false
for cle in "${!COMPTER_DOMAINES[@]}"; do
  if [[ "${COMPTER_DOMAINES[$cle]}" -gt 1 ]]; then
    log "  ⚠ ${cle} → ${COMPTER_DOMAINES[$cle]} VirtualHost (conflit)"
    dup=true
    ((avert++)) || true
  fi
done
[[ "$dup" == false ]] && log "  ✓ aucun doublon détecté"
log ""

log "── 6. Projets /var/www ──"
for d in /var/www/*/; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  [[ "$name" == "html" || "$name" == "certbot" || "$name" == ".npm" ]] && continue
  idx=""
  [[ -f "${d}index.php" ]] && idx="index.php"
  [[ -f "${d}public/index.php" ]] && idx="public/index.php"
  [[ -f "${d}index.html" ]] && idx="index.html"
  log "  ${name} → ${idx:-⚠ pas d'index trouvé}"
done
log ""

log "── 7. Tests HTTP locaux ──"
DOMAINS=(hamlabor.org profildeborah.duckdns.org shk-annonce.duckdns.org hamlab5.duckdns.org)
for d in "${DOMAINS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 -k "https://${d}/" 2>/dev/null || echo "ERR")
  log "  https://${d}/ → HTTP ${code}"
  if [[ "$code" == "404" ]]; then
    log "     ❌ 404 — vérifier DocumentRoot"
    ((erreur++)) || true
  elif [[ "$code" == "000" || "$code" == "ERR" ]]; then
    log "     ❌ connexion impossible"
    ((erreur++)) || true
  fi
done
log ""

log "── 8. Certificats Let's Encrypt ──"
certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains:|Expiry" || log "(certbot indisponible)"
log ""

log "══════════════════════════════════════════════════════════════"
log "  RÉSUMÉ : ${erreur} erreur(s), ${avert} avertissement(s)"
log "══════════════════════════════════════════════════════════════"
log ""
if [[ $erreur -gt 0 || $avert -gt 0 ]]; then
  log "Actions recommandées :"
  log "  cd /var/www/sigh-ham && git pull"
  log "  bash deploy/fix-apache-projets.sh"
  log ""
  log "Corrections manuelles fréquentes :"
  log "  sed -i 's|/var/www/ham|/var/www/ham_project|g' /etc/apache2/sites-available/000-default-le-ssl.conf"
  log "  a2dissite ham.conf le-redirect-hamlabor.org.conf ProfilDeborah-http.conf"
  log "  certbot --apache -d DOMAINE --email bokulubelvie@gmail.com --agree-tos"
fi
log ""

exit 0
