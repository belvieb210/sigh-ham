# Sauvegardes PostgreSQL SIGH (données complètes)
#
# ⚠️ NE PAS committer de dump contenant des données patients / mots de passe
#    sur un dépôt public. Préférez un repo PRIVÉ ou GitHub Releases.
#
# Les migrations (structure) sont déjà versionnées dans :
#   prisma/migrations/
#
# Workflow :
#   VPS  → bash deploy/export-postgres.sh
#   PC   → bash deploy/import-postgres.sh prisma/backups/sigh_ham_YYYYMMDD.sql
#
