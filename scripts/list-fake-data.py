#!/usr/bin/env python3
"""Lista todos os dados de teste/fake no Supabase para análise."""
import requests

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}

# Lista tabelas relevantes
tables_to_check = [
    "orders",
    "prospects",
    "leads",
    "briefings",
    "testimonials",
    "coupons",
    "countdown_campaigns",
    "envios",
    "respostas",
    "lead_crm",
    "abandoned_carts",
    "queue_entries",
    "subscriptions",
    "affiliates",
    "notifications",
    "whatsapp_messages",
    "email_campaigns",
    "leads_crm",
    "recovery_logs",
]

print("=" * 60)
print("ANÁLISE DE DADOS DE TESTE NO BANCO")
print("=" * 60)

for table in tables_to_check:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}?select=*",
        headers=headers,
        timeout=15,
    )
    if r.status_code == 200:
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            print(f"\n📋 {table}: {len(data)} registros")
            # Mostra 3 amostras
            for item in data[:3]:
                # Pega campos identificadores
                identifiers = {k: v for k, v in item.items() if k in ['id', 'name', 'email', 'customer_email', 'customer_name', 'product_slug', 'prospect_name', 'author_name', 'client_name', 'title', 'code', 'headline', 'status', 'price_cents', 'created_at'] if v}
                print(f"   - {identifiers}")
        else:
            print(f"\n✅ {table}: 0 registros (limpo)")
    elif r.status_code == 404:
        print(f"\n⚠️  {table}: tabela não existe")
    else:
        print(f"\n❌ {table}: erro {r.status_code} - {r.text[:100]}")
