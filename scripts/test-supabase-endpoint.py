#!/usr/bin/env python3
"""Testa qual endpoint Supabase aceita SQL direto."""
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
PROJECT_ID = env.get("SUPABASE_PROJECT_ID", "jckkbsluvbejioyrlcfo")

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

# Test 1: REST API
print("Test 1: REST /rest/v1/ tables list")
r = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=15)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    tables = list(data.keys())[:10]
    print(f"  Tables: {tables}")

# Test 2: Criar RPC para executar SQL (se não existir)
print("\nTest 2: Tentar criar RPC exec_sql via /rest/v1/rpc")
# O Supabase NÃO permite DDL via RPC por padrão. Precisamos usar o pg endpoint.

# Test 3: PG endpoint (Studio)
print("\nTest 3: Tentar /pg/sql endpoint")
r = requests.post(
    f"https://api.supabase.com/v1/projects/{PROJECT_ID}/database/sql",
    headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    },
    json={"query": "SELECT 1 as test"},
    timeout=15,
)
print(f"  Status: {r.status_code}")
print(f"  Body: {r.text[:300]}")

# Test 4: Management API
print("\nTest 4: Management API database")
r = requests.get(
    f"https://api.supabase.com/v1/projects/{PROJECT_ID}",
    headers={"Authorization": f"Bearer {SERVICE_KEY}"},
    timeout=15,
)
print(f"  Status: {r.status_code}")
print(f"  Body: {r.text[:300]}")
