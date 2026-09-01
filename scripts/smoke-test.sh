#!/usr/bin/env bash
# Smoke test: start dev server, probe all routes, save outputs, kill server.
set -u
cd /home/z/my-project/app

# Clean any previous server
pkill -f 'vite' 2>/dev/null
sleep 1

# Start dev server fully detached
setsid nohup bun run dev > /tmp/dev.log 2>&1 < /dev/null &
SERVER_PID=$!
disown
echo "Server PID: $SERVER_PID"

# Wait for port 8080 to come up (max 30s)
READY=0
for i in $(seq 1 60); do
  if ss -tln 2>/dev/null | grep -q ':8080'; then
    READY=1
    break
  fi
  sleep 0.5
done
echo "Ready after ${i}s (READY=$READY)"

if [ "$READY" != "1" ]; then
  echo "!!! Dev server did not come up"
  tail -50 /tmp/dev.log
  exit 1
fi

# Probe routes
probe() {
  local path="$1"
  local out="/tmp/resp$(echo "$path" | tr / _).html"
  local code
  code=$(curl -sS -o "$out" -w "%{http_code}" --max-time 20 "http://localhost:8080$path" 2>/dev/null)
  local size=$(wc -c < "$out" 2>/dev/null)
  printf "  %-25s  HTTP %s  %s bytes\n" "$path" "$code" "$size"
}

echo "=== Probing routes ==="
probe "/"
probe "/sobre"
probe "/termos"
probe "/privacidade"
probe "/faq"
probe "/auth"
probe "/apps"
probe "/biblioteca"
probe "/criadores-parceiros"
probe "/knowledge"
probe "/fila/auditoria-perfil"
probe "/checkout/auditoria-perfil"
probe "/checkout/sucesso"
probe "/checkout/cancelado"
probe "/apoiar/flashctb"
probe "/sitemap.xml"

echo "=== Title on / ==="
grep -oE '<title>[^<]+</title>' /tmp/resp_.html 2>/dev/null | head -1

echo "=== JSON-LD on / ==="
grep -oE 'application/ld\+json' /tmp/resp_.html 2>/dev/null | head -1

echo "=== Killing dev server ==="
pkill -f 'vite' 2>/dev/null
sleep 1
echo "Done."
