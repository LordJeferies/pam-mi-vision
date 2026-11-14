#!/bin/bash
set -euo pipefail
OWNER='LordJeferies'
REPO='pam-mi-vision'
ZIP_DEFAULT='Pam_Mi_Vision_V2_Alfa_GitHubPages.zip'
ZIP="${1:-}"
if [ -z "$ZIP" ]; then
  ZIP=$(find "$HOME/Downloads" -maxdepth 3 -type f -name "$ZIP_DEFAULT" -print -quit)
fi
if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then echo '❌ No se encontró el ZIP en Descargas.'; exit 1; fi
for TOOL in git gh unzip rsync; do
  if ! command -v "$TOOL" >/dev/null 2>&1; then echo "❌ Falta instalar: $TOOL"; exit 1; fi
done
if ! gh auth status >/dev/null 2>&1; then gh auth login --web --git-protocol https; fi
LOGIN=$(gh api user --jq '.login')
if [ "$(echo "$LOGIN" | tr '[:upper:]' '[:lower:]')" != "$(echo "$OWNER" | tr '[:upper:]' '[:lower:]')" ]; then
  echo "❌ Conectado como $LOGIN, se necesita $OWNER"; exit 1
fi
unzip -t "$ZIP" >/dev/null
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir "$TMP/source"
unzip -q "$ZIP" -d "$TMP/source"
INDEX=$(find "$TMP/source" -maxdepth 4 -type f -name index.html -print -quit)
if [ -z "$INDEX" ]; then echo '❌ El ZIP no contiene index.html'; exit 1; fi
SRC=$(dirname "$INDEX")
for F in app.js data.js styles.css sw.js manifest.webmanifest assets/icon-192.png assets/icon-512.png; do
  if [ ! -f "$SRC/$F" ]; then echo "❌ Falta $F"; exit 1; fi
done
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  gh repo clone "$OWNER/$REPO" "$TMP/repo"
  cd "$TMP/repo"
  git checkout main
  git pull --ff-only origin main
else
  mkdir "$TMP/repo"
  cd "$TMP/repo"
  git init -b main
  gh repo create "$OWNER/$REPO" --public --source=. --remote=origin
fi
# Respaldar archivos previos del repositorio dentro de Descargas.
BACKUP="$HOME/Downloads/pam-mi-vision-respaldo-repo-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP" --exclude=.git -C "$TMP/repo" .
echo "✅ Copia previa: $BACKUP"
rsync -av --exclude='.git/' "$SRC/" "$TMP/repo/"
git add -A
if git diff --cached --quiet; then echo '✅ No hay cambios por publicar.'; else
  git -c user.name="$OWNER" -c user.email="$OWNER@users.noreply.github.com" commit -m 'Release Pam Mi Vision V2 Alfa'
  git push -u origin main
fi
if ! gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  gh api --method POST "repos/$OWNER/$REPO/pages" -f 'source[branch]=main' -f 'source[path]=/' || echo '⚠️ Revisa GitHub Pages en Settings → Pages.'
fi
URL="https://${OWNER}.github.io/${REPO}/"
echo "✅ V2 Alfa enviada a $URL"
open "$URL" || true
