#!/usr/bin/env bash
set -e

# Push openwa-service/ to its own GitHub repo: clodoaldo-openwa
# This lets Railway deploy it as a standalone service.

TOKEN="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"
OWNER="clodoaldosilva608"
REPO="clodoaldo-openwa"

# 1. Create the repo (idempotent — if it exists, ignore error)
echo "[1/4] Creating GitHub repo $OWNER/$REPO …"
curl -sS -X POST "https://api.github.com/user/repos" \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"$REPO\",\"description\":\"Open-WA WhatsApp service for clodoaldo.vercel.app\",\"private\":true,\"has_issues\":false,\"has_wiki\":false}" \
  > /tmp/gh-repo-create.json 2>&1 || true
echo "  → done (or already exists)"

# 2. Init a fresh git repo inside openwa-service/
WORKDIR="/home/z/my-project/openwa-service"
cd "$WORKDIR"
rm -rf .git
git init -q
git config user.email "clodoaldo608@gmail.com"
git config user.name "Clodoaldo Silva"
git branch -M main

# 3. Commit everything
git add -A
git commit -q -m "Open-WA Railway service v1.0

- Express HTTP API compatible with /admin/whatsapp page
- Open-WA wa-automate with puppeteer (Chrome headless)
- Dockerfile pre-installs all Chromium system deps
- railway.json with healthcheck + restart policy
- Endpoints: /health /getConnectionState /qr /sendText /screenshot
- Daily limit: 50 messages
- Auto-forwards inbound messages to /api/whatsapp/webhook
- Session persistence via /data volume"
echo "[2/4] Committed"

# 4. Push
REMOTE="https://${TOKEN}@github.com/${OWNER}/${REPO}.git"
git remote add origin "$REMOTE" 2>/dev/null || git remote set-url origin "$REMOTE"
git push -f -q origin main
echo "[3/4] Pushed to $OWNER/$REPO"

# 5. Verify
echo "[4/4] Repo URL: https://github.com/$OWNER/$REPO"
echo "      Deploy target: https://railway.app/new"
