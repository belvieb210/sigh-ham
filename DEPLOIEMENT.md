# Déploiement SIGH HAM sur VPS Contabo

Hébergement du module **Réception** sur [hamlab5.duckdns.org](https://hamlab5.duckdns.org) (IP `185.202.236.210`).

Dépôt GitHub : [belvieb210/sigh-ham](https://github.com/belvieb210/sigh-ham)

## Architecture recommandée (VPS avec d'autres sites Apache)

| Composant | Rôle |
|-----------|------|
| **Nginx** | Port **80** et **443** — HTTPS pour SIGH, reverse proxy vers Apache pour les autres projets |
| **Apache** | Port **8080** — vos sites PHP existants **inchangés** |
| **Next.js** | Port **3000** — application SIGH |
| **Socket.IO** | Port **3001** — messagerie temps réel |

> **Ne pas arrêter Apache** si d'autres projets tournent dessus. Nginx passe devant ; Apache reste actif sur 8080.

Scripts dans `deploy/` :

- `deploy/install-vps.sh` — PostgreSQL, Redis, Node 22, utilisateur `sigh`
- `deploy/deploy-app.sh` — build, migrations, seeds, systemd
- `deploy/migrate-nginx-apache.sh` — **Nginx + Apache coexistants + HTTPS** (recommandé)
- `deploy/setup-apache-sigh.sh` — Apache seul sur :80 (sans Nginx, si pas d'autres sites)
- `deploy/fix-nginx-bootstrap.sh` — Nginx HTTP seul (sans SSL, sans Apache)

---

## 1. Déploiement initial (VPS)

```bash
git clone https://github.com/belvieb210/sigh-ham.git /var/www/sigh-ham
cd /var/www/sigh-ham
chmod +x deploy/*.sh
bash deploy/install-vps.sh
sudo -u sigh bash deploy/deploy-app.sh --seed
sudo -u sigh npm run db:seed:reception
sudo -u sigh npm run db:seed:messagerie
```

---

## 2. HTTPS + Nginx (sans casser les autres sites Apache)

**Email Let's Encrypt :** `bokulubelvie@gmail.com`

```bash
cd /var/www/sigh-ham
git pull
bash deploy/migrate-nginx-apache.sh
```

Ce script :

1. Déplace Apache du port **80** → **8080** (autres projets conservés)
2. Installe Nginx sur **80/443**
3. Obtient le certificat SSL pour `hamlab5.duckdns.org`
4. Active **https://hamlab5.duckdns.org** → Next.js :3000

Puis redémarrez l'app si besoin :

```bash
sudo -u sigh npm run build
sudo systemctl restart sigh-web sigh-socket
```

Si la migration s'arrête avec `options-ssl-nginx.conf` introuvable (certificat OK mais Nginx pas rechargé) :

```bash
cd /var/www/sigh-ham
git pull
bash deploy/finish-nginx-ssl.sh
```

Si Apache garde le port 443 (`profildeborah` ou autre certificat servi) :

```bash
# Commenter TOUS les Listen 443 (y compris indentés)
sed -i 's/^\([[:space:]]*\)Listen 443/\1#Listen 443/' /etc/apache2/ports.conf
systemctl restart apache2
ss -tlnp | grep ':443'   # ne doit plus afficher apache
bash deploy/finish-nginx-ssl.sh
```

> **Note :** `profildeborah.duckdns.org` en HTTPS passera aussi par Nginx une fois le port 443 libéré. Il faudra ajouter un bloc `server` Nginx pour ce domaine (proxy → Apache:8080) si vous en avez besoin.

**Test :** https://hamlab5.duckdns.org/connexion

Compte réception (seed) :

- Email : `bokulubelvie@gmail.com`
- Mot de passe : `Belvie210@!!`

---

## 3. Erreur navigateur `crypto.randomUUID` / `textarea-recorder`

Ces fichiers (`textarea-recorder.js`, `g0RatingsPopup.js`, etc.) viennent d'**extensions navigateur** (Grammarly, etc.), pas de SIGH.

| Cause | Solution |
|-------|----------|
| Site en HTTP | HTTPS via `migrate-nginx-apache.sh` |
| Extension qui injecte du JS | Tester en **navigation privée** ou désactiver l'extension |
| `removeChild` React | Souvent provoqué par l'extension ; disparaît après HTTPS + sans extension |

---

## 4. Alternative : Apache seul (configuration actuelle)

Si vous n'avez **aucun autre site** sur ce VPS :

```bash
bash deploy/setup-apache-sigh.sh
certbot --apache -d hamlab5.duckdns.org \
  --email bokulubelvie@gmail.com \
  --agree-tos --non-interactive --redirect
```

---

## 5. Nginx ne démarre pas

Cause fréquente : config HTTPS copiée **avant** certbot → certificats absents.

```bash
bash /var/www/sigh-ham/deploy/fix-nginx-bootstrap.sh
```

Puis migration complète :

```bash
bash /var/www/sigh-ham/deploy/migrate-nginx-apache.sh
```

Diagnostic :

```bash
nginx -t
ss -tlnp | grep -E ':80|:443|:8080'
journalctl -xeu nginx.service --no-pager | tail -30
```

---

## 6. Renouvellement SSL

Certbot installe un timer systemd automatique. Vérification :

```bash
certbot renew --dry-run
```

---

## 7. GitHub (PC Windows)

```powershell
cd c:\xampp\htdocs\ham-projet
git add .
git commit -m "fix: déploiement HTTPS nginx+apache"
git push origin main
```

Sur le VPS : `git pull` puis rebuild si le code a changé.
