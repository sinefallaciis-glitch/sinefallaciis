#!/usr/bin/env bash
# Auditoría Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO) de varias páginas.
# Uso: npm run build && bash scripts/lighthouse.sh
# Necesita Google Chrome o Chromium. Si no hay navegador, avisa y termina sin error.
set -u
CHROME="${CHROME_PATH:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)}"
if [ -z "$CHROME" ]; then echo "Lighthouse: no hay navegador disponible, se omite."; exit 0; fi
export CHROME_PATH="$CHROME"

PUERTO=4399
python3 -m http.server $PUERTO --directory dist > /tmp/sf-preview.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
sleep 2

PAGINAS="/ /falacias/ $(ls src/content/*/*.md | head -3 | sed -E 's#src/content/([^/]+)/([^/]+)\.md#/\1/\2/#')"
echo "| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |"
echo "|---|---|---|---|---|"
for P in $PAGINAS; do
  timeout 180 npx -y lighthouse@latest "http://localhost:$PUERTO$P" --quiet \
    --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=/tmp/sf-lh.json >/dev/null 2>&1 \
    && node -e "const c=require('/tmp/sf-lh.json').categories;const s=k=>c[k]?Math.round(c[k].score*100):'—';console.log('| $P | '+[s('performance'),s('accessibility'),s('best-practices'),s('seo')].join(' | ')+' |')" \
    || echo "| $P | error | | | |"
done
