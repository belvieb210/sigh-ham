#!/usr/bin/env bash
# =============================================================================
# Alias : même chose que DEPLOIEMENT.sh à la racine du projet.
# Usage : bash /var/www/sigh-ham/deploy/deployer.sh
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec bash "${ROOT}/DEPLOIEMENT.sh" "$@"
