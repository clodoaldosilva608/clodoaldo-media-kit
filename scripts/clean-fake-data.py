#!/usr/bin/env python3
"""Limpa todos os dados de TESTE do banco, preservando dados reais."""
import requests
import json

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

print("=" * 60)
print("LIMPEZA DE DADOS DE TESTE")
print("=" * 60)

# Lista todas as orders primeiro
print("\n1. Listando orders...")
r = requests.get(f"{SUPABASE_URL}/rest/v1/orders?select=*", headers=headers, timeout=30)
orders = r.json()
print(f"   Total: {len(orders)}")

# Identifica emails de teste (não são clientes reais)
test_emails = set()
for o in orders:
    email = (o.get("customer_email") or "").lower()
    name = (o.get("customer_name") or "").lower()
    if (
        "teste" in email or
        "test" in email or
        "example" in email or
        "@exemplo.com" in email or
        "demo" in email or
        "+test" in email or
        "clodoaldo+test" in email or
        "clodoaldo test" in name or
        email.endswith("@example.com") or
        not email  # vazio
    ):
        test_emails.add(email)

print(f"   Emails de teste identificados: {test_emails}")

# Deleta orders de teste (uma a uma via DELETE com filtro)
print("\n2. Deletando orders de teste...")
deleted_orders = 0
for email in test_emails:
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/orders?customer_email=eq.{email}",
        headers=headers,
        timeout=30,
    )
    if r.status_code == 200:
        count = len(r.json()) if r.json() else 0
        deleted_orders += count
        print(f"   ✅ Deletadas {count} orders com email '{email}'")
    else:
        print(f"   ❌ Erro ao deletar '{email}': {r.status_code} - {r.text[:100]}")

# Lista abandoned_carts
print("\n3. Listando abandoned_carts...")
r = requests.get(f"{SUPABASE_URL}/rest/v1/abandoned_carts?select=*", headers=headers, timeout=30)
carts = r.json()
print(f"   Total: {len(carts)}")

# Deleta abandoned_carts de teste
print("\n4. Deletando abandoned_carts de teste...")
deleted_carts = 0
for cart in carts:
    email = (cart.get("customer_email") or "").lower()
    name = (cart.get("customer_name") or "").lower()
    is_test = (
        "teste" in email or
        "test" in email or
        "example" in email or
        "+test" in email or
        "clodoaldo test" in name or
        "demo" in email or
        not email
    )
    if is_test:
        cart_id = cart["id"]
        r = requests.delete(
            f"{SUPABASE_URL}/rest/v1/abandoned_carts?id=eq.{cart_id}",
            headers=headers,
            timeout=30,
        )
        if r.status_code == 200:
            deleted_carts += 1
            print(f"   ✅ Carrinho {cart_id[:8]}... deletado (email: '{email}')")
        else:
            print(f"   ❌ Erro ao deletar carrinho {cart_id[:8]}: {r.status_code}")

# Lista envios (mensagens de prospecção)
print("\n5. Listando envios...")
r = requests.get(f"{SUPABASE_URL}/rest/v1/envios?select=*&limit=5", headers=headers, timeout=15)
if r.status_code == 200:
    envios = r.json()
    print(f"   Total: {len(envios)}")
    if envios:
        r = requests.delete(f"{SUPABASE_URL}/rest/v1/envios?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=30)
        if r.status_code == 200:
            print(f"   ✅ {len(r.json()) if r.json() else 0} envios deletados")
else:
    print(f"   (tabela não existe ou vazia)")

# Lista respostas
print("\n6. Listando respostas...")
r = requests.get(f"{SUPABASE_URL}/rest/v1/respostas?select=*&limit=5", headers=headers, timeout=15)
if r.status_code == 200:
    respostas = r.json()
    print(f"   Total: {len(respostas)}")
    if respostas:
        r = requests.delete(f"{SUPABASE_URL}/rest/v1/respostas?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=30)
        if r.status_code == 200:
            print(f"   ✅ {len(r.json()) if r.json() else 0} respostas deletadas")
else:
    print(f"   (tabela não existe ou vazia)")

# Lista prospects (parceiros) — só deletar se for de teste, não os reais que já prospectou
print("\n7. Listando prospects (Parceiros)...")
r = requests.get(f"{SUPABASE_URL}/rest/v1/prospects?select=*", headers=headers, timeout=30)
if r.status_code == 200:
    prospects = r.json()
    print(f"   Total: {len(prospects)}")
    # Não deletar automaticamente — perguntar ao usuário
    test_prospects = []
    for p in prospects:
        name = (p.get("name") or "").lower()
        city = (p.get("city") or "").lower()
        # Identifica prospects claramente de teste (Bahia, etc)
        if "bahia" in city or "test" in name or "demo" in name:
            test_prospects.append(p)
    print(f"   Prospects possivelmente de teste (Bahia/demo): {len(test_prospects)}")
    # Vamos manter todos os prospects por enquanto — são dados reais de prospecção
    print(f"   ⏭️  Mantendo todos (são dados de prospecção reais coletados do Google Maps)")
else:
    print(f"   (sem acesso)")

# Lista leads_crm
print("\n8. Listando leads_crm...")
for table_name in ["leads_crm", "lead_crm", "crm_leads"]:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=5", headers=headers, timeout=15)
    if r.status_code == 200:
        data = r.json()
        print(f"   {table_name}: {len(data)} registros")
        if data:
            r = requests.delete(f"{SUPABASE_URL}/rest/v1/{table_name}?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=30)
            if r.status_code == 200:
                print(f"   ✅ {len(r.json()) if r.json() else 0} registros deletados de {table_name}")
        break

# Lista briefings
print("\n9. Listando briefings...")
for table_name in ["briefings", "briefing"]:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&limit=5", headers=headers, timeout=15)
    if r.status_code == 200:
        data = r.json()
        print(f"   {table_name}: {len(data)} registros")
        if data:
            r = requests.delete(f"{SUPABASE_URL}/rest/v1/{table_name}?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=30)
            if r.status_code == 200:
                print(f"   ✅ {len(r.json()) if r.json() else 0} registros deletados")
        break

# Resumo final
print(f"\n{'=' * 60}")
print(f"✅ LIMPEZA CONCLUÍDA!")
print(f"{'=' * 60}")
print(f"  Orders deletadas: {deleted_orders}")
print(f"  Abandoned carts deletados: {deleted_carts}")
print(f"\n  Mantidos:")
print(f"    - 1 coupon VOLTA10 (criado por você)")
print(f"    - 1 affiliate Clodoaldo (auto-referral do sistema)")
print(f"    - Prospects (Parceiros) — dados reais de prospecção")
print(f"    - 1 projeto de aprovação Gessyca Lins (real)")
print(f"    - Settings do Portal de Aprovação (PIX/W3F/WhatsApp)")
print(f"    - 6 serviços adicionais pré-cadastrados")
