#!/usr/bin/env bash
# Inicia o dev server E testa tudo em uma única sessão bash.
set -u
cd /home/z/my-project

# Matar qualquer dev anterior
pkill -9 -f 'next-server' 2>/dev/null
pkill -9 -f 'bun.*run.*dev' 2>/dev/null
pkill -9 -f 'keep-dev-alive' 2>/dev/null
sleep 3

# Limpar cache turbopack
rm -rf /home/z/my-project/.next/cache 2>/dev/null

# Subir dev server detached
setsid nohup bun run dev > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown
DEV_PID=$!
echo "Dev PID: $DEV_PID"

# Esperar porta 3000 (max 30s)
READY=0
for i in $(seq 1 60); do
  if ss -tln 2>/dev/null | grep -q ':3000'; then
    READY=1
    echo "✅ Porta 3000 ouvindo após ${i}s"
    break
  fi
  sleep 0.5
done
if [ "$READY" != "1" ]; then
  echo "❌ Dev server não subiu"
  tail -30 /home/z/my-project/dev.log
  exit 1
fi

# Subir keep-alive watcher para mantê-lo vivo
setsid nohup bash /home/z/my-project/scripts/keep-dev-alive.sh > /tmp/keep.log 2>&1 < /dev/null &
disown
echo "Keep-alive iniciado"

# Esperar mais 5s para estabilizar
sleep 5

# Pré-aquecer o cache (primeira request demora 18s)
echo "=== Pré-aquecendo cache (pode demorar 20s) ==="
curl -sS -o /tmp/warm.html -w "  / HTTP %{http_code} | size=%{size_download} | time=%{time_total}s\n" --max-time 60 http://localhost:3000/
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/warm.html | head -1)"

# Testar tudo em sequência
echo ""
echo "=== Teste 1: localhost:3000/ ==="
curl -sS -o /tmp/3000.html -w "HTTP %{http_code} | size=%{size_download} | time=%{time_total}s\n" --max-time 30 http://localhost:3000/
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/3000.html | head -1)"
echo "  Has Clodoaldo: $(grep -c 'Clodoaldo' /tmp/3000.html)"
echo "  Has clodoaldo-hero.png: $(grep -c 'clodoaldo-hero.png' /tmp/3000.html)"

echo ""
echo "=== Teste 2: localhost:81/ (gateway) ==="
curl -sS -o /tmp/81.html -w "HTTP %{http_code} | size=%{size_download} | time=%{time_total}s\n" --max-time 30 http://localhost:81/
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/81.html | head -1)"
echo "  Has Clodoaldo: $(grep -c 'Clodoaldo' /tmp/81.html)"

echo ""
echo "=== Teste 3: URL pública ==="
URL="https://preview-chat-8e0db441-89cb-408f-b4da-aa1e00aa1aff.space-z.ai/"
curl -sS -o /tmp/pub.html -w "HTTP %{http_code} | size=%{size_download} | time=%{time_total}s\n" --max-time 30 "$URL"
echo "  Title: $(grep -oE '<title>[^<]+</title>' /tmp/pub.html | head -1)"
echo "  Has Clodoaldo: $(grep -c 'Clodoaldo' /tmp/pub.html)"

echo ""
echo "=== Teste 4: Assets ==="
curl -sS -o /dev/null -w "  /assets/clodoaldo-logo.png  HTTP %{http_code} | size=%{size_download}\n" --max-time 10 http://localhost:3000/assets/clodoaldo-logo.png
curl -sS -o /dev/null -w "  /assets/clodoaldo-hero.png  HTTP %{http_code} | size=%{size_download}\n" --max-time 10 http://localhost:3000/assets/clodoaldo-hero.png
curl -sS -o /dev/null -w "  /assets/apps/app-soulmap.jpg HTTP %{http_code} | size=%{size_download}\n" --max-time 10 http://localhost:3000/assets/apps/app-soulmap.jpg

echo ""
echo "=== Final: dev.log tail ==="
tail -15 /home/z/my-project/dev.log
