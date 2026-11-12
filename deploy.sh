#!/usr/bin/env bash
# Publica o console Grupo Endor no servidor. A pasta /opt/rustdesk/admin-ui é
# montada no contêiner rustdesk-api em /app/resources/admin (URL /_admin/).
# Não precisa de sudo: a pasta pertence ao usuário endor.
#
# Uso (Git Bash, na pasta do projeto):  ./deploy.sh
set -euo pipefail

SERVER="${SERVER:-endor@192.168.0.33}"
KEY="${KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_DIR="/opt/rustdesk/admin-ui"

cd "$(dirname "$0")"
npx vite build
tar -C dist -czf ge-admin-ui.tgz .
scp -i "$KEY" -q ge-admin-ui.tgz "$SERVER:/tmp/ge-admin-ui.tgz"
rm -f ge-admin-ui.tgz
ssh -i "$KEY" "$SERVER" "set -e
  rm -rf /tmp/ge-admin-ui && mkdir -p /tmp/ge-admin-ui
  tar -C /tmp/ge-admin-ui -xzf /tmp/ge-admin-ui.tgz
  find $REMOTE_DIR -mindepth 1 -delete
  cp -a /tmp/ge-admin-ui/. $REMOTE_DIR/
  rm -rf /tmp/ge-admin-ui /tmp/ge-admin-ui.tgz
  echo 'Publicado em $REMOTE_DIR'"
