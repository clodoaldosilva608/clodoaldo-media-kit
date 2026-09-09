#!/usr/bin/env python3
"""Lista emails únicos das orders para identificar testes."""
import requests

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"

headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

# Lista todas as orders
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/orders?select=id,customer_email,customer_name,product_slug,status,created_at&order=created_at.desc",
    headers=headers, timeout=30,
)
orders = r.json()
print("RAW:", orders)
print(f"Type: {type(orders)}")
if isinstance(orders, dict) and "error" in orders:
    print("Erro:", orders["error"])
    exit(1)
if isinstance(orders, list):
    orders = orders
elif isinstance(orders, dict):
    orders = orders.get("data", [])

print(f"Total orders: {len(orders)}")
print("\nEmails únicos:")
emails = {}
for o in orders:
    if not isinstance(o, dict):
        continue
    email = o.get("customer_email") or "(vazio)"
    if email not in emails:
        emails[email] = []
    emails[email].append(o)

for email, items in emails.items():
    print(f"\n  {email} ({len(items)} orders):")
    for item in items[:3]:
        print(f"    - {item.get('customer_name', 'sem nome')} | {item.get('product_slug', '?')} | {item.get('status')} | {item.get('created_at', '')[:10]}")
