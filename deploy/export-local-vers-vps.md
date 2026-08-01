# Synchroniser PostgreSQL local → VPS

## Attention

| Direction | Sens |
|-----------|------|
| ❌ Ce que vous avez fait | Export **VPS → PC** (dump 16 Ko, presque vide) |
| ✅ Ce qu’il faut pour avoir les données locales en prod | Export **PC → VPS** |

Les patients `PAT-2026-0341` (KABAMBA, etc.) affichés sur le VPS étaient des **données mock** du code (fallback si API 500), **pas** des données PostgreSQL.

---

## 1. Sur le PC Windows — exporter la base locale

**Git Bash** (PostgreSQL `psql`/`pg_dump` dans le PATH) :

```bash
cd /c/xampp/htdocs/ham-projet
bash deploy/export-postgres.sh
ls -lh prisma/backups/
```

Ou manuellement (remplacez le mot de passe) :

```bash
# Sans ?schema=public
pg_dump "postgresql://postgres:VOTRE_MDP@localhost:5432/sigh_ham" \
  --no-owner --no-acl --clean --if-exists \
  -f prisma/backups/sigh_ham_local.sql
gzip -f prisma/backups/sigh_ham_local.sql
```

Vérifiez la taille : si le dump fait encore ~16 Ko, la base locale est aussi vide.

---

## 2. Envoyer le dump sur le VPS

```powershell
scp c:\xampp\htdocs\ham-projet\prisma\backups\sigh_ham_*.sql.gz root@185.202.236.210:/var/www/sigh-ham/prisma/backups/
```

---

## 3. Sur le VPS — importer (⚠️ écrase la base prod)

```bash
cd /var/www/sigh-ham
chown -R sigh:sigh prisma/backups

# Backup prod d’abord
bash deploy/export-postgres.sh

# Import du dump local
sudo -u sigh bash deploy/import-postgres.sh prisma/backups/sigh_ham_local.sql.gz

# Rebuild + restart
sudo -u sigh npm run build
systemctl restart sigh-web sigh-socket
```

---

## 4. Corriger d’abord l’erreur 500 (même sans import)

```bash
journalctl -u sigh-web -n 40 --no-pager | grep -iE "error|P2022|photo"
bash deploy/migrate-db.sh --pull
systemctl restart sigh-web
```

Si vous voyez `column patients.photo_url does not exist` → la migration n’est pas appliquée.
