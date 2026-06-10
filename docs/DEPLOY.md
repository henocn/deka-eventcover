# Deploiement Linux

Ce guide suppose un serveur Ubuntu/Debian avec Node.js, npm, PostgreSQL, Nginx et PM2.

## 1. Prerequis serveur

```bash
sudo apt update
sudo apt install -y nginx postgresql gettext-base
sudo npm install -g pm2
```

Installez Node.js LTS selon votre methode preferee avant de lancer le deploy.

## 2. Variables d'environnement

Creer `.env` a la racine du projet, ou `backend/.env`.

Exemple minimal :

```bash
NODE_ENV=production
PORT=3000

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deka_eventcover
DB_USER=deka_user
DB_PASSWORD=change_me

JWT_SECRET=replace_with_a_long_random_secret
MEDIA_ROOT=/var/www/deka-eventcover/uploads
MAX_UPLOAD_MB=50

PUBLIC_APP_URL=https://events.example.com
PARTICIPANT_APP_URL=https://events.example.com
FRONTEND_APP_URL=https://events.example.com
BACKOFFICE_APP_URL=https://admin.example.com
```

## 3. Deployer l'application

Depuis la racine du projet :

```bash
chmod +x scripts/deploy.sh scripts/install-nginx.sh
APP_NAME=deka-eventcover BACKEND_PORT=3000 ./scripts/deploy.sh
```

Par defaut, le script :

- installe les dependances de `frontend`, `backoffice`, `backend`
- build `frontend/dist`
- build `backoffice/dist`
- lance les migrations Sequelize
- demarre ou redemarre le backend avec PM2

Pour lancer aussi les seeders :

```bash
RUN_SEEDERS=true ./scripts/deploy.sh
```

## 4. Installer la configuration Nginx

```bash
PUBLIC_DOMAIN=events.example.com \
BACKOFFICE_DOMAIN=admin.example.com \
PROJECT_ROOT=/var/www/deka-eventcover \
BACKEND_PORT=3000 \
CLIENT_MAX_BODY_SIZE=50M \
./scripts/install-nginx.sh
```

Ensuite installer SSL :

```bash
sudo certbot --nginx -d events.example.com -d www.events.example.com -d admin.example.com -d www.admin.example.com
```

## 5. Commandes utiles

```bash
pm2 status
pm2 logs deka-eventcover-api
pm2 restart deka-eventcover-api --update-env
sudo nginx -t
sudo systemctl reload nginx
```
