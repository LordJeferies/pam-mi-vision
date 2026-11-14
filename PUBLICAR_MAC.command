#!/bin/bash
set -euo pipefail
ZIP="${1:-}"
if [ -z "$ZIP" ]; then ZIP=$(find "$HOME/Downloads" -maxdepth 3 -type f -name 'Pamela_Mi_Vision_WIZARD_GitHubPages*.zip' -print -quit); fi
if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then echo 'ZIP no encontrado en Descargas'; exit 1; fi
for t in gh git unzip rsync; do command -v "$t" >/dev/null || { echo "Falta $t"; exit 1; }; done
if ! gh auth status >/dev/null 2>&1; then gh auth login --web --git-protocol https; fi
USER=$(gh api user --jq .login)
if [ "$(echo "$USER" | tr '[:upper:]' '[:lower:]')" != lordjeferies ]; then echo "Cuenta equivocada: $USER"; exit 1; fi
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir "$TMP/source"; unzip -q "$ZIP" -d "$TMP/source"
SRC=$(find "$TMP/source" -maxdepth 5 -type f -name manifest.webmanifest -print -quit)
[ -n "$SRC" ] || { echo 'Manifiesto ausente'; exit 1; }; SRC=$(dirname "$SRC")
for f in index.html sw.js assets/icon.svg; do [ -f "$SRC/$f" ] || { echo "Falta $f"; exit 1; }; done
if gh repo view LordJeferies/pam-mi-vision >/dev/null 2>&1; then
 gh repo clone LordJeferies/pam-mi-vision "$TMP/repo"
else
 mkdir "$TMP/repo"; cd "$TMP/repo"; git init -b main; gh repo create LordJeferies/pam-mi-vision --public --source=. --remote=origin
fi
cd "$TMP/repo"
git checkout main >/dev/null 2>&1 || true
rsync -a --exclude='.git/' "$SRC/" "$TMP/repo/"
git add index.html manifest.webmanifest sw.js README.md assets/icon.svg PUBLICAR_MAC.command
if ! git diff --cached --quiet; then
 git -c user.name=LordJeferies -c user.email=LordJeferies@users.noreply.github.com commit -m 'Update Pam meditation with step-by-step wizard'
 git push -u origin main
fi
if ! gh api repos/LordJeferies/pam-mi-vision/pages >/dev/null 2>&1; then gh api -X POST repos/LordJeferies/pam-mi-vision/pages -f 'source[branch]=main' -f 'source[path]=/' || true; fi
echo 'Publicado: https://lordjeferies.github.io/pam-mi-vision/'
open 'https://lordjeferies.github.io/pam-mi-vision/'
