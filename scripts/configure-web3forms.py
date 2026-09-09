#!/usr/bin/env python3
"""Configura Web3Forms access key nas settings do portal."""
import requests

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"
WEB3FORMS_KEY = "7994d6fa-fe37-4480-8f04-caa53c03e088"
NOTIFICATION_EMAIL = "clodoaldosilva608@gmail.com"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Atualiza settings
r = requests.patch(
    f"{SUPABASE_URL}/rest/v1/approval_settings?id=eq.00000000-0000-0000-0000-000000000001",
    headers=headers,
    json={
        "web3forms_access_key": WEB3FORMS_KEY,
        "notification_email": NOTIFICATION_EMAIL,
    },
    timeout=30,
)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    print("✅ Web3Forms Access Key configurada!")
    print(f"✅ Notification email: {NOTIFICATION_EMAIL}")
    print("\nAgora emails automáticos serão enviados para:")
    print("  - Cliente quando projeto é enviado ao portal")
    print("  - Você quando cliente pede alteração")
    print("  - Você quando cliente aprova projeto")
else:
    print(f"Erro: {r.text}")
