#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-deka-eventcover}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
CLIENT_MAX_BODY_SIZE="${CLIENT_MAX_BODY_SIZE:-50M}"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-}"
BACKOFFICE_DOMAIN="${BACKOFFICE_DOMAIN:-}"

TEMPLATE="$PROJECT_ROOT/scripts/nginx-deka-eventcover.conf.template"
TARGET="/etc/nginx/sites-available/${APP_NAME}.conf"
ENABLED="/etc/nginx/sites-enabled/${APP_NAME}.conf"

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

[ -n "$PUBLIC_DOMAIN" ] || fail "Set PUBLIC_DOMAIN, example: PUBLIC_DOMAIN=event.example.com"
[ -n "$BACKOFFICE_DOMAIN" ] || fail "Set BACKOFFICE_DOMAIN, example: BACKOFFICE_DOMAIN=admin.example.com"
[ -f "$TEMPLATE" ] || fail "Template not found: $TEMPLATE"
command -v envsubst >/dev/null 2>&1 || fail "Missing envsubst. Install gettext-base."
command -v nginx >/dev/null 2>&1 || fail "Missing nginx."

export APP_NAME PROJECT_ROOT BACKEND_PORT CLIENT_MAX_BODY_SIZE PUBLIC_DOMAIN BACKOFFICE_DOMAIN

envsubst '${PROJECT_ROOT} ${BACKEND_PORT} ${CLIENT_MAX_BODY_SIZE} ${PUBLIC_DOMAIN} ${BACKOFFICE_DOMAIN}' \
  < "$TEMPLATE" | sudo tee "$TARGET" >/dev/null

sudo ln -sfn "$TARGET" "$ENABLED"
sudo nginx -t
sudo systemctl reload nginx

printf 'Nginx config installed: %s\n' "$TARGET"
