#!/usr/bin/env bash
set -Eeuo pipefail

# Deka EventCover deployment script for Linux servers.
# Run from the project root after pulling the latest code.

APP_NAME="${APP_NAME:-deka-eventcover}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
NODE_ENV="${NODE_ENV:-production}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_SEEDERS="${RUN_SEEDERS:-false}"

FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKOFFICE_DIR="$PROJECT_ROOT/backoffice"
BACKEND_DIR="$PROJECT_ROOT/backend"
SHARED_ENV="$PROJECT_ROOT/.env"
BACKEND_ENV="$BACKEND_DIR/.env"

log() {
  printf '\n\033[1;32m%s\033[0m\n' "$1"
}

fail() {
  printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

npm_install_clean() {
  local target_dir="$1"
  cd "$target_dir"

  if [ -f package-lock.json ]; then
    npm ci --include=dev
  else
    npm install
  fi
}

require_env() {
  local key="$1"
  if ! grep -Eq "^${key}=" "$SHARED_ENV" "$BACKEND_ENV" 2>/dev/null; then
    fail "Missing required env variable: ${key}. Put it in .env or backend/.env"
  fi
}

log "Checking deployment prerequisites"
need_cmd node
need_cmd npm
need_cmd pm2

[ -d "$PROJECT_ROOT" ] || fail "Project root not found: $PROJECT_ROOT"
[ -d "$FRONTEND_DIR" ] || fail "Frontend directory not found: $FRONTEND_DIR"
[ -d "$BACKOFFICE_DIR" ] || fail "Backoffice directory not found: $BACKOFFICE_DIR"
[ -d "$BACKEND_DIR" ] || fail "Backend directory not found: $BACKEND_DIR"

if [ ! -f "$SHARED_ENV" ] && [ ! -f "$BACKEND_ENV" ]; then
  fail "No .env found. Create $SHARED_ENV or $BACKEND_ENV before deploying."
fi

require_env DB_NAME
require_env DB_USER
require_env DB_PASSWORD
require_env JWT_SECRET

export NODE_ENV
export PORT="$BACKEND_PORT"

log "Installing and building participant frontend"
npm_install_clean "$FRONTEND_DIR"
npm run build

log "Installing and building backoffice"
npm_install_clean "$BACKOFFICE_DIR"
npm run build

log "Installing backend dependencies"
npm_install_clean "$BACKEND_DIR"

if [ "$RUN_MIGRATIONS" = "true" ]; then
  log "Running database migrations"
  cd "$BACKEND_DIR"
  npx sequelize-cli db:migrate --env production
fi

if [ "$RUN_SEEDERS" = "true" ]; then
  log "Running database seeders"
  cd "$BACKEND_DIR"
  npx sequelize-cli db:seed:all --env production
fi

log "Restarting backend with PM2"
cd "$PROJECT_ROOT"
if pm2 describe "$APP_NAME-api" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME-api" --update-env
else
  pm2 start "$BACKEND_DIR/index.js" \
    --name "$APP_NAME-api" \
    --cwd "$BACKEND_DIR" \
    --time \
    --update-env
fi

pm2 save

log "Deployment complete"
printf 'Participant dist: %s\n' "$FRONTEND_DIR/dist"
printf 'Backoffice dist:  %s\n' "$BACKOFFICE_DIR/dist"
printf 'Backend PM2 app:  %s-api\n' "$APP_NAME"
