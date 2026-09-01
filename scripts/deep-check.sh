#!/usr/bin/env bash
# Deeper inspection: start dev, check assets, webhook, content of key pages.
set -u
cd /home/z/my-project/app

pkill -f 'vite' 2>/dev/null
sleep 1

setsid nohup bun run dev > /tmp/dev.log 2>&1 < /dev/null &
disown
echo "Server starting..."

for i in $(seq 1 60); do
  if ss -tln 2>/dev/null | grep -q ':8080'; then break; fi
  sleep 0.5
done
echo "Ready after ${i}s"

echo ""
echo "=== Static assets / PWA ==="
curl -sS -o /dev/null -w "  /robots.txt            HTTP %{http_code}  %{size_download} bytes  ct=%{content_type}\n" http://localhost:8080/robots.txt
curl -sS -o /dev/null -w "  /manifest.webmanifest   HTTP %{http_code}  %{size_download} bytes  ct=%{content_type}\n" http://localhost:8080/manifest.webmanifest
curl -sS -o /dev/null -w "  /favicon.ico            HTTP %{http_code}  %{size_download} bytes  ct=%{content_type}\n" http://localhost:8080/favicon.ico

echo ""
echo "=== Stripe webhook (GET, should be 405 since it expects POST) ==="
curl -sS -o /tmp/webhook.txt -w "  GET /api/public/stripe-webhook  HTTP %{http_code}  %{size_download} bytes\n" http://localhost:8080/api/public/stripe-webhook
echo "  body: $(head -c 200 /tmp/webhook.txt)"

echo ""
echo "=== Stripe webhook (POST without signature, should be 400) ==="
curl -sS -X POST -o /tmp/webhook2.txt -w "  POST /api/public/stripe-webhook HTTP %{http_code}  %{size_download} bytes\n" http://localhost:8080/api/public/stripe-webhook
echo "  body: $(head -c 300 /tmp/webhook2.txt)"

echo ""
echo "=== Home page check: JSON-LD / OG / canonical / preload ==="
curl -sS http://localhost:8080/ > /tmp/home.html
echo "  og:title:    $(grep -oE 'og:title"[^>]*content="[^"]+' /tmp/home.html | head -1)"
echo "  canonical:   $(grep -oE 'rel="canonical"[^>]*' /tmp/home.html | head -1)"
echo "  preload img: $(grep -oE 'rel="preload"[^>]*' /tmp/home.html | head -1)"
echo "  ld+json:     $(grep -oE 'application/ld\+json' /tmp/home.html | head -1)"
echo "  html lang:   $(grep -oE '<html[^>]*lang="[^"]+"' /tmp/home.html | head -1)"
echo "  has Header:  $(grep -c 'Clodoaldo' /tmp/home.html) refs to 'Clodoaldo'"

echo ""
echo "=== Knowledge hub sample ==="
curl -sS http://localhost:8080/knowledge > /tmp/k.html
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/k.html | head -1)"
echo "  Has paywall-card component: $(grep -c 'paywall' /tmp/k.html)"
echo "  Has 'knowledge' in body:    $(grep -c 'knowledge\|Knowledge\|Hub' /tmp/k.html)"

echo ""
echo "=== Apps page (one of the heaviest) ==="
curl -sS http://localhost:8080/apps > /tmp/apps.html
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/apps.html | head -1)"
echo "  app cards found (approx): $(grep -c 'apps-carousel\|app-card\|app-preview' /tmp/apps.html)"

echo ""
echo "=== Dev log: errors / warnings ==="
grep -iE 'error|warn|fail' /tmp/dev.log | grep -v 'wrangler' | head -20

pkill -f 'vite' 2>/dev/null
sleep 1
echo ""
echo "Done."
