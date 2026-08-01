# Commandes VPS SIGH — guide rapide

Tous les scripts sont dans `/var/www/sigh-ham/deploy/`.

## Auto-déploiement (recommandé)

Exécuté **chaque minute** par crontab — ne rebuild **que** s’il y a du nouveau.

```bash
# Installer / mettre à jour le crontab
bash /var/www/sigh-ham/deploy/install-crontab.sh

# Forcer un déploiement maintenant
bash /var/www/sigh-ham/deploy/auto-deploy-cron.sh --force

# Voir les logs
tail -f /var/www/sigh-ham/logs/auto-deploy.log
```

### Comment ça se déclenche

| Événement | Action |
|-----------|--------|
| `git push` sur GitHub `main` | Pull + migrate + build + restart |
| Dump déposé dans `prisma/backups/inbox/` | Import UTF-8 + fix accents + build + restart |
| Rien de nouveau | **Rien** (pas de build inutile) |

### Importer une base depuis votre PC

```powershell
# Windows — envoyer le dump dans l'inbox (auto-import sous 1 minute)
scp prisma\backups\mon_dump.sql.gz root@185.202.236.210:/var/www/sigh-ham/prisma/backups/inbox/
```

Pas besoin de lancer d’autres commandes sur le VPS.

---

## Scripts manuels (si besoin)

| Script | Rôle |
|--------|------|
| `auto-deploy-cron.sh` | Tout-en-un intelligent (crontab 1 min) |
| `migrate-db.sh --pull` | Migrations seules |
| `deploy-app.sh` | Déploiement complet manuel |
| `export-postgres.sh` | Backup PostgreSQL |
| `import-postgres.sh fichier.sql.gz` | Import dump |
| `fix-encodage-utf8.sh` | Corrige `MÃ©decins` → `Médecins` |
| `cron-maintenance.sh` | Backup quotidien + migrations |

---

## Après un push GitHub

Rien à faire sur le VPS : le cron détecte le commit sous **1 minute**.

---

## Logs

```
/var/www/sigh-ham/logs/auto-deploy.log
/var/www/sigh-ham/logs/cron-maintenance.log
/var/www/sigh-ham/logs/migrate-db.log
```
