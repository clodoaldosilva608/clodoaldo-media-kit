#!/usr/bin/env python3
"""Verifica/cria usuário admin no Supabase para teste."""
import os
import sys
import requests
import json

# Carrega env
env = {}
with open("/home/z/my-project/.env.local") as f:
    for line in f:
        line = line.strip()
        if line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")

SUPABASE_URL = env.get("SUPABASE_URL", "")
SERVICE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
ADMIN_EMAIL = "clodoaldosilva608@gmail.com"

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Service key (first 20): {SERVICE_KEY[:20]}...")
print(f"Admin email: {ADMIN_EMAIL}")

# Tenta listar usuários
headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Listar usuários
print("\n=== Listando usuários ===")
r = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers, timeout=30)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    users = r.json().get("users", [])
    print(f"Total de usuários: {len(users)}")
    for u in users[:10]:
        print(f"  - {u.get('email')} | id: {u.get('id')} | created: {u.get('created_at', '')[:10]}")
else:
    print(f"Erro: {r.text[:500]}")

# Atualizar senha do admin
print(f"\n=== Atualizando senha do admin {ADMIN_EMAIL} ===")
# Primeiro precisa achar o user_id
r = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=headers, timeout=30)
if r.status_code == 200:
    users = r.json().get("users", [])
    admin_user = next((u for u in users if u.get("email") == ADMIN_EMAIL), None)
    if admin_user:
        uid = admin_user["id"]
        print(f"Admin user_id: {uid}")
        # Update password
        r2 = requests.put(
            f"{SUPABASE_URL}/auth/v1/admin/users/{uid}",
            headers=headers,
            json={"password": "Clodoaldo@2025!"},
            timeout=30,
        )
        print(f"Update status: {r2.status_code}")
        if r2.status_code == 200:
            print("✅ Senha atualizada para: Clodoaldo@2025!")
        else:
            print(f"Erro: {r2.text[:500]}")
    else:
        print("Admin não encontrado na lista")
else:
    print("Erro ao listar usuários")
