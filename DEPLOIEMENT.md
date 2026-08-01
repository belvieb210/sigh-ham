# Déploiement SIGH HAM sur VPS Contabo

Hébergement du module **Réception** sur [hamlab5.duckdns.org](https://hamlab5.duckdns.org) (IP `185.202.236.210`).

Dépôt GitHub : [belvieb210/sigh-ham](https://github.com/belvieb210/sigh-ham)

Voir aussi les scripts dans `deploy/` :

- `deploy/install-vps.sh` — installation VPS (PostgreSQL, Redis, Nginx, Node 22)
- `deploy/deploy-app.sh` — build, migrations, redémarrage

## GitHub (PC Windows)

```powershell
cd c:\xampp\htdocs\ham-projet
git init
git add .
git commit -m "Initial commit — SIGH HAM réception"
git branch -M main
git remote add origin https://github.com/belvieb210/sigh-ham.git
git push -u origin main
```

Créez d'abord le repo **sigh-ham** (privé recommandé) sur GitHub.

## VPS (SSH root)

```bash
git clone https://github.com/belvieb210/sigh-ham.git /var/www/sigh-ham
cd /var/www/sigh-ham
chmod +x deploy/*.sh
bash deploy/install-vps.sh
sudo -u sigh bash deploy/deploy-app.sh --seed
certbot --nginx -d hamlab5.duckdns.org --email bokulubelvie@gmail.com --agree-tos --non-interactive
cp deploy/nginx/sigh-ham.conf /etc/nginx/sites-available/sigh-ham
nginx -t && systemctl reload nginx
```

## Nginx ne démarre pas

Cause fréquente : config **HTTPS** (`sigh-ham.conf`) copiée **avant** certbot → certificats absents.

```bash
bash /var/www/sigh-ham/deploy/fix-nginx-bootstrap.sh
```

Puis voir l’erreur exacte :

```bash
nginx -t
journalctl -xeu nginx.service --no-pager | tail -30
```

