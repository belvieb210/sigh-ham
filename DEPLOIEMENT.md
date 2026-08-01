# Déploiement SIGH HAM sur VPS Contabo

Hébergement du module **Réception** sur [hamlab5.duckdns.org](https://hamlab5.duckdns.org) (IP `185.202.236.210`).

Dépôt GitHub : [belvieb210/sigh-ham](https://github.com/belvieb210/sigh-ham)

## Architecture — Apache seul (recommandé si vous avez déjà des projets PHP)

| Composant | Rôle |
|-----------|------|
| **Apache** | Port **80** et **443** — tous vos sites PHP + proxy SIGH |
| **Next.js** | Port **3000** — SIGH (interne, Apache proxy pour `hamlab5.duckdns.org`) |
| **Socket.IO** | Port **3001** — messagerie temps réel |
| **MySQL/MariaDB** | Bases des projets existants — **inchangées** |
| **PostgreSQL** | Base SIGH (`sigh_ham`) — **séparée** |

> **Nginx n'est pas nécessaire.** Apache gère tout : `hamlabor.org`, `profildeborah.duckdns.org`, etc. avec leurs certificats SSL habituels (`certbot --apache`).

### Revenir à Apache seul (après migration Nginx)

```bash
cd /var/www/sigh-ham
git pull
chmod +x deploy/*.sh
bash deploy/rollback-apache-only.sh
```

Ce script : arrête Nginx, remet Apache sur **80/443**, restaure les VirtualHost, **ne touche pas aux bases de données**.

---

## Architecture alternative — Nginx devant Apache (option avancée)

| Composant | Rôle |
|-----------|------|
| **Nginx** | Port **80** et **443** |
| **Apache** | Port **8080** — projets PHP en arrière-plan |

Scripts :

- `deploy/install-vps.sh` — PostgreSQL, Redis, Node 22, utilisateur `sigh`
- `deploy/deploy-app.sh` — build, migrations, seeds, systemd
- `deploy/rollback-apache-only.sh` — **retour Apache 80/443** (recommandé)
- `deploy/setup-apache-sigh.sh` — Apache seul, installation initiale SIGH
- `deploy/migrate-nginx-apache.sh` — Nginx + Apache (option avancée)
- `deploy/setup-nginx-apache-sites.sh` — sites Apache via Nginx
- `deploy/fix-nginx-bootstrap.sh` — Nginx HTTP seul

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

> **Note :** après migration, restaurez les autres sites avec la section 8 ci-dessous.

**Test :** https://hamlab5.duckdns.org/connexion

Compte réception (seed) :

- Email : `bokulubelvie@gmail.com`
- Mot de passe : `Belvie210@!!`

---

### Audit complet des autres sites

```bash
cd /var/www/sigh-ham
git pull
bash deploy/diagnostic-apache-complet.sh
# Rapport détaillé :
bash deploy/diagnostic-apache-complet.sh --export | tee /root/apache-audit.txt
```

Puis appliquer les corrections :

```bash
bash deploy/fix-apache-projets.sh
```

Sites attendus :

| Domaine | Dossier | Type |
|---------|---------|------|
| `hamlabor.org` | `/var/www/ham_project` | PHP (index.php à la racine) |
| `profildeborah.duckdns.org` | `/var/www/ProfilDeborah` | PHP |
| `shk-annonce.duckdns.org` | `/var/www/shk-annonce` | PHP |
| `hamlab5.duckdns.org` | proxy → `:3000` | SIGH Next.js ✅ |

Problèmes connus à corriger :

| Erreur | Cause | Fix |
|--------|-------|-----|
| 404 hamlabor.org | `DocumentRoot /var/www/ham` inexistant | `fix-apache-projets.sh` |
| Certificat SIGH invalide | Pas de vhost SSL `sigh-ham-le-ssl` | `certbot --apache -d hamlab5.duckdns.org` |
| Doublons VirtualHost | `ham.conf`, `000-default-le-ssl`, `le-redirect` | script les désactive |
| profildeborah | anciens `ProfilDeborah.conf` en conflit | script recrée config propre |

---

Après migration Nginx, le **DocumentRoot** Apache peut être incorrect.

```bash
cd /var/www/sigh-ham
git pull
bash deploy/fix-apache-projets.sh
```

Le script recrée les VirtualHost pour `hamlabor.org`, `profildeborah.duckdns.org`, etc.  
Éditez `deploy/projets-apache.list` si le chemin du projet diffère.

Diagnostic manuel :

```bash
apache2ctl -S | grep -i hamlabor
grep -r DocumentRoot /etc/apache2/sites-enabled/
ls -la /var/www/ham_project/public/
curl -I https://hamlabor.org
```

---

Erreur **`NET::ERR_CERT_COMMON_NAME_INVALID`** sur `hamlabor.org` : Nginx servait le certificat de `hamlab5.duckdns.org` car aucun bloc SSL n'existait pour `hamlabor.org`.

```bash
cd /var/www/sigh-ham
git pull
chmod +x deploy/*.sh

# 1. Regénère Nginx pour chaque VirtualHost Apache → proxy :8080
bash deploy/setup-nginx-apache-sites.sh

# 2. Crée les certificats manquants (hamlabor.org, etc.)
bash deploy/setup-nginx-apache-sites.sh --certificats

# 3. Recharge SIGH si besoin
cp deploy/nginx/sigh-ham-coexist-ssl.conf /etc/nginx/sites-available/sigh-ham
nginx -t && systemctl reload nginx
```

Vérifications :

```bash
curl -I http://hamlabor.org
curl -I https://hamlabor.org
curl -I https://profildeborah.duckdns.org
apache2ctl -S          # VirtualHost sur :8080
ls /etc/nginx/sites-enabled/
```

Projets dans `/var/www/` (servis par Apache) :

| Dossier | Domaine typique |
|---------|-----------------|
| `ham_project` | `hamlabor.org` |
| `ProfilDeborah` | `profildeborah.duckdns.org` |
| `shk-annonce` | (voir `apache2ctl -S`) |
| `sigh-ham` | `hamlab5.duckdns.org` → Nginx → Next.js :3000 |

---

## 9. Erreurs API SIGH (401 / 500)

| Erreur | Cause probable | Action |
|--------|----------------|--------|
| `POST /api/auth/connexion` **401** | Identifiant ou mot de passe incorrect | `bokulubelvie@gmail.com` / `Belvie210@!!` — relancer `sudo -u sigh npm run db:seed:reception` |
| `GET /api/reception/patients` **401** | Non connecté (cookie session absent) | Se connecter d'abord sur `/connexion` |
| `GET /api/reception/patients` **500** | Erreur serveur / base de données | `journalctl -u sigh-web -n 50 --no-pager` |

Diagnostic connexion :

```bash
curl -s -X POST https://hamlab5.duckdns.org/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"identifiant":"bokulubelvie@gmail.com","motDePasse":"Belvie210@!!"}'
```

Réponse attendue : `"redirect":"/sigh/reception"` (pas 401).

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

---

## 8. Export / import base de données SIGH

### Important : PostgreSQL, pas MySQL

| Projet | Base de données |
|--------|-----------------|
| **SIGH** (`sigh-ham`) | **PostgreSQL** (`sigh_ham`) |
| **hamlabor.org** (`ham_project`) | **MySQL** (projet PHP séparé) |

Nginx/Apache = serveurs web, **pas** des bases de données.

### Migrations (structure) — déjà sur GitHub

Le dossier `prisma/migrations/` contient **toute la structure** (tables, colonnes).  
Inutile de l'exporter : il est versionné avec le code.

```bash
# Nouveau PC ou VPS : appliquer les migrations
npm run db:migrate:deploy
npm run db:seed
npm run db:seed:reception
```

### Données complètes (patients, utilisateurs, messages…)

**Sur le VPS (production) :**

```bash
cd /var/www/sigh-ham
git pull
chmod +x deploy/*.sh
bash deploy/sync-db-vps-to-local.sh
# ou : sudo -u sigh npm run db:export
```

**Sur votre PC (import) :**

```powershell
# 1. Copier le dump depuis le VPS
scp root@185.202.236.210:/var/www/sigh-ham/prisma/backups/sigh_ham_XXXXXX.sql.gz prisma/backups/

# 2. PostgreSQL local requis (pas MySQL XAMPP pour SIGH)
#    Installez PostgreSQL ou utilisez Docker

# 3. .env local avec DATABASE_URL pointant vers votre PostgreSQL local

# 4. Import
bash deploy/import-postgres.sh prisma/backups/sigh_ham_XXXXXX.sql.gz
npx prisma generate
npm run dev
```

### Envoyer le dump sur GitHub

⚠️ **Repo PRIVÉ obligatoire** — le dump contient des données patients et des mots de passe hashés.

Par défaut les fichiers `prisma/backups/*.sql.gz` sont **ignorés** par git (`.gitignore`).

Pour forcer l'ajout (repo privé seulement) :

```bash
git add -f prisma/backups/sigh_ham_XXXXXX.sql.gz
git commit -m "backup: dump production YYYY-MM-DD"
git push origin main
```

Alternative recommandée : [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github) pour les gros fichiers.

### ham_project (MySQL) — projet PHP séparé

Export MySQL (sur le VPS, **pas** SIGH) :

```bash
mysqldump -u USER -p NOM_BASE > ham_project_backup.sql
```

Ce dump concerne `hamlabor.org`, pas le module SIGH Next.js.
