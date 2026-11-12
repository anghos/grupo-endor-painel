#!/usr/bin/env bash
# Publica no servidor, sem sudo (as pastas pertencem ao usuário endor):
#  - console administrativo -> /opt/rustdesk/admin-ui      (contêiner rustdesk-api, URL /_admin/)
#  - página de download     -> /opt/rustdesk/download-page (contêiner rustdesk-proxy, URL /baixar/)
#
# Uso (Git Bash, na pasta do projeto):  ./deploy.sh
set -euo pipefail

SERVER="${SERVER:-endor@192.168.0.33}"
KEY="${KEY:-$HOME/.ssh/id_ed25519}"

cd "$(dirname "$0")"
npx vite build
tar -C dist -czf ge-admin-ui.tgz .
tar -C download-page -czf ge-download-page.tgz .
scp -i "$KEY" -q ge-admin-ui.tgz ge-download-page.tgz "$SERVER:/tmp/"
rm -f ge-admin-ui.tgz ge-download-page.tgz

ssh -i "$KEY" "$SERVER" 'set -e
publish () {
  dir=$1; pkg=$2
  if [ ! -w "$dir" ]; then echo "AVISO: $dir não existe ou não é gravável; pulando"; return; fi
  rm -rf /tmp/ge-pub && mkdir -p /tmp/ge-pub
  tar -C /tmp/ge-pub -xzf "$pkg"
  find "$dir" -mindepth 1 -delete
  cp -a /tmp/ge-pub/. "$dir"/
  rm -rf /tmp/ge-pub
  echo "Publicado em $dir"
}
publish /opt/rustdesk/admin-ui /tmp/ge-admin-ui.tgz
publish /opt/rustdesk/download-page /tmp/ge-download-page.tgz
rm -f /tmp/ge-admin-ui.tgz /tmp/ge-download-page.tgz'
