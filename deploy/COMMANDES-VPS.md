# Commandes VPS SIGH — guide rapide

Tous les scripts sont dans `/var/www/sigh-ham/deploy/`.

## Sur le VPS — un seul fichier

Après un push GitHub (ou depuis le PC avec `DEPLOIEMENT-VPS.bat`), sur le serveur :

```bash
cd /var/www/sigh-ham
bash DEPLOIEMENT.sh
```

Équivalent :

```bash
bash /var/www/sigh-ham/deploy/deployer.sh
```

Cela fait : `git pull` → migrate → **build** → **restart** `sigh-web` / `sigh-socket`.

---

## Depuis votre PC — un seul fichier

1. **Une seule fois** : vérifiez le mot de passe dans `deploy/vps.local.env`  
   (copie de `deploy/vps.local.env.example` — **jamais** sur GitHub).

2. **À chaque modification** : double-cliquez à la racine du projet :

```
DEPLOIEMENT-VPS.bat
```

Cela fait automatiquement :

| Étape | Action |
|-------|--------|
| 1 | `git add` + `commit` des changements locaux |
| 2 | `git push` vers GitHub `main` |
| 3 | SSH VPS → `git pull` |
| 4 | `auto-deploy-cron.sh --force` → migrate + **build** + **restart** `sigh-web` / `sigh-socket` |

Équivalent PowerShell :

```powershell
cd C:\xampp\htdocs\ham-projet
.\deploy\push-and-deploy.ps1
.\deploy\push-and-deploy.ps1 -Message "feat: mon changement"
.\deploy\push-and-deploy.ps1 -DeployOnly
```

---

## Auto-déploiement (sur le VPS, en fond)

Même sans lancer le `.bat`, un **crontab chaque minute** peut détecter un nouveau commit GitHub et rebuild. Installer / vérifier :

```bash
bash /var/www/sigh-ham/deploy/install-crontab.sh
bash /var/www/sigh-ham/deploy/auto-deploy-cron.sh --force
tail -f /var/www/sigh-ham/logs/auto-deploy.log
```

| Événement | Action |
|-----------|--------|
| `git push` sur GitHub `main` | Pull + migrate + build + restart |
| Dump dans `prisma/backups/inbox/` | Import + build + restart |
| Rien de nouveau | Aucun build |

### Importer une base depuis votre PC

```powershell
# Windows — envoyer le dump dans l'inbox (auto-import sous 1 minute)
scp prisma\backups\mon_dump.sql.gz root@185.202.236.210:/var/www/sigh-ham/prisma/backups/inbox/
```

Pas besoin de lancer d’autres commandes sur le VPS.

### Erreur `npm ci` / ENOTEMPTY (node_modules)

Si `npm ci` échoue avec `ENOTEMPTY: directory not empty`, le dossier `node_modules` n’a pas été entièrement supprimé (souvent après un `rm -rf` interrompu).

**Réparation rapide (SSH root) :**

```bash
systemctl stop sigh-web sigh-socket
cd /var/www/sigh-ham
chmod -R u+w node_modules 2>/dev/null || true
mv node_modules node_modules.trash.$(date +%s) 2>/dev/null || true
nohup rm -rf node_modules.trash.* node_modules >/dev/null 2>&1 &
sudo -u sigh -H bash -lc 'cd /var/www/sigh-ham && npm ci'
bash deploy/deploy-app.sh
```

Ou, après `git pull` (script à jour) :

```bash
bash /var/www/sigh-ham/deploy/fix-node-modules.sh
```

---

## Scripts manuels (si besoin)

| Script | Rôle |
|--------|------|
| `DEPLOIEMENT-VPS.bat` (PC) | Tout-en-un depuis Windows |
| `push-and-deploy.ps1` (PC) | Même chose en PowerShell |
| `auto-deploy-cron.sh` | Tout-en-un intelligent (crontab 1 min) |
| `fix-node-modules.sh` | Réparer `npm ci` / ENOTEMPTY sur node_modules |
| `migrate-db.sh --pull` | Migrations seules |
| `deploy-app.sh` | Déploiement complet manuel |
| `export-postgres.sh` | Backup PostgreSQL |
| `import-postgres.sh fichier.sql.gz` | Import dump |
| `fix-encodage-utf8.sh` | Corrige `MÃ©decins` → `Médecins` |
| `cron-maintenance.sh` | Backup quotidien + migrations |

---

## Après un push GitHub

- **Recommandé** : double-clic `DEPLOIEMENT-VPS.bat` (immédiat).
- **Sinon** : le cron VPS détecte le commit sous **~1 minute**.

---

## Logs

```
/var/www/sigh-ham/logs/auto-deploy.log
/var/www/sigh-ham/logs/cron-maintenance.log
/var/www/sigh-ham/logs/migrate-db.log
```
