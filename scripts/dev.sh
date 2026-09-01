#!/usr/bin/env bash
# Conveniência: inicia o dev server do projeto Clodoaldo Silva em segundo plano.
# Uso:  bash /home/z/my-project/scripts/dev.sh
# Para parar:  pkill -f 'vite'  (ou apenas fechar o terminal)
set -u
cd /home/z/my-project/app

# Mata qualquer dev server anterior
pkill -f 'vite' 2>/dev/null
sleep 1

# Inicia dev server detached
setsid nohup bun run dev > /tmp/dev.log 2>&1 < /dev/null &
disown

# Espera a porta 8080 abrir (max 30s)
for i in $(seq 1 60); do
  if ss -tln 2>/dev/null | grep -q ':8080'; then
    echo "✅ Dev server pronto em http://localhost:8080/ (PID: $!)"
    echo "   Logs: tail -f /tmp/dev.log"
    exit 0
  fi
  sleep 0.5
done

echo "❌ Dev server não subiu em 30s. Veja /tmp/dev.log:"
tail -20 /tmp/dev.log
exit 1
