#!/usr/bin/env bash
set -Eeuo pipefail

# Manual maintenance script for an already configured Linux server.
# Run it from anywhere; it resolves the project root automatically.

PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKOFFICE_DIR="$PROJECT_ROOT/backoffice"
BACKEND_DIR="$PROJECT_ROOT/backend"
PM2_APP="${PM2_APP:-deka-eventcover-api}"
NODE_ENV="${NODE_ENV:-production}"

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

install_and_build() {
  local target_dir="$1"
  local label="$2"

  [ -d "$target_dir" ] || fail "$label directory not found: $target_dir"

  log "Installing $label dependencies"
  cd "$target_dir"
  npm install

  log "Building $label"
  npm run build
}

log "Checking prerequisites"
need_cmd git
need_cmd npm
need_cmd pm2

[ -d "$PROJECT_ROOT/.git" ] || fail "Project root is not a git repository: $PROJECT_ROOT"
[ -d "$BACKEND_DIR" ] || fail "Backend directory not found: $BACKEND_DIR"

log "Pulling latest code"
cd "$PROJECT_ROOT"
git pull --ff-only

install_and_build "$FRONTEND_DIR" "frontend participant"
install_and_build "$BACKOFFICE_DIR" "backoffice"

log "Running backend migrations"
cd "$BACKEND_DIR"
export NODE_ENV
npm run db:migrate

log "Reloading PM2 app: $PM2_APP"
pm2 describe "$PM2_APP" >/dev/null 2>&1 || fail "PM2 app not found: $PM2_APP"
pm2 reload "$PM2_APP" --update-env

log "Maintenance complete"
