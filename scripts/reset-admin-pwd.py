#!/usr/bin/env python3
"""Atualiza a senha do admin real."""
import requests

env = {}
with open("/home/z/my-project/.env.local") as f:
    for line in f:
        line = line.strip()
        if line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")

SUPABASE_URL = env["SUPABASE_URL"]
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
ADMIN_EMAIL = "clodoaldo608@gmail.com"
NEW_PASSWORD = "Clodoaldo@2025!"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# List users
r = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers, timeout=30)
users = r.json().get("users", [])
admin_user = next((u for u in users if u.get("email") == ADMIN_EMAIL), None)
if not admin_user:
    print(f"ERRO: admin {ADMIN_EMAIL} não encontrado")
    print("Usuários disponíveis:", [u["email"] for u in users])
    sys.exit(1)

uid = admin_user["id"]
print(f"Admin user_id: {uid}")

# Update password
r2 = requests.put(
    f"{SUPABASE_URL}/auth/v1/admin/users/{uid}",
    headers=headers,
    json={"password": NEW_PASSWORD},
    timeout=30,
)
print(f"Update status: {r2.status_code}")
if r2.status_code == 200:
    print(f"✅ Senha atualizada para: {NEW_PASSWORD}")
else:
    print(f"Erro: {r2.text[:500]}")
    import sys
    sys.exit(1)
