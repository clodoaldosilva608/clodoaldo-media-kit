#!/usr/bin/env bash
# Mantém o dev server vivo: recria se morrer
set -u
cd /home/z/my-project

while true; do
  if ! ss -tln 2>/dev/null | grep -q ':3000'; then
    echo "[$(date)] Dev server não está ouvindo, reiniciando..."
    pkill -9 -f 'next-server' 2>/dev/null
    pkill -9 -f 'bun run dev' 2>/dev/null
    sleep 2
    rm -rf /home/z/my-project/.next/cache 2>/dev/null
    setsid nohup bun run dev > /home/z/my-project/dev.log 2>&1 < /dev/null &
    disown
    echo "[$(date)] PID do novo processo: $!"
    # Espera 25s para estabilizar
    for i in $(seq 1 25); do
      if ss -tln 2>/dev/null | grep -q ':3000'; then
        echo "[$(date)] ✅ Dev server pronto após ${i}s"
        break
      fi
      sleep 1
    done
  fi
  sleep 5
done
