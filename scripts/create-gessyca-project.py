#!/usr/bin/env python3
"""Cria projeto de aprovação para Gessyca Lins e envia notificação por WhatsApp."""
import requests
import secrets
import string
import json

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"
SITE_URL = "https://clodoaldo.vercel.app"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Gera token aleatório de 32 chars
def gen_token(length=32):
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))

token = gen_token(32)
print(f"Token gerado: {token}")

# Dados do projeto
project = {
    "client_token": token,
    "client_name": "Gessyca Lins",
    "client_email": None,
    "client_whatsapp": "55819094057216",  # formato internacional
    "project_title": "Site Versículo do Dia",
    "project_type": "website",
    "preview_url": "https://versiculododiaa.lovable.app",
    "preview_html": None,
    "notes_for_client": "Olá Gessyca! Seu site está pronto para revisão. Acesse o preview, navegue por todas as páginas e me diga se há algo que deseja ajustar. Quando estiver 100% satisfeita, clique em 'Aprovar projeto'. Qualquer dúvida, é só me chamar no WhatsApp.",
    "project_scope": "Site institucional Versículo do Dia:\n- Home com versículo diário\n- Páginas internas\n- Design responsivo (mobile + desktop)\n- SEO básico\n- Integração com WhatsApp\n- 3 rodadas de revisão inclusas",
    "out_of_scope_examples": "Itens fora do escopo que podem ter custo adicional:\n- Adicionar nova página (R$ 197)\n- Integração com sistema de pagamento\n- App mobile nativo\n- Sistema de login de usuários\n- Alteração completa de design após aprovação",
    "status": "draft",
    "max_revisions": 3,
    "current_revision": 0,
    "theme": "inherit",
    "expires_at": None,
    "access_password": None,
}

print("\n1. Criando projeto no Supabase...")
r = requests.post(
    f"{SUPABASE_URL}/rest/v1/approval_projects",
    headers=headers,
    json=project,
    timeout=30,
)
print(f"Status: {r.status_code}")
if r.status_code not in (200, 201):
    print(f"Erro: {r.text}")
    exit(1)

created = r.json()[0] if isinstance(r.json(), list) else r.json()
project_id = created["id"]
print(f"✅ Projeto criado! ID: {project_id}")

# Criar revisão #1 e marcar como sent
print("\n2. Criando revisão #1 (envio ao cliente)...")
revision = {
    "project_id": project_id,
    "revision_number": 1,
    "preview_url": "https://versiculododiaa.lovable.app",
    "preview_html": None,
    "notes": "Primeira versão do site Versículo do Dia pronta para revisão.",
    "images": None,
    "status": "sent",
    "sent_at": "now()",
}
r = requests.post(
    f"{SUPABASE_URL}/rest/v1/approval_revisions",
    headers=headers,
    json=revision,
    timeout=30,
)
print(f"Status: {r.status_code}")
if r.status_code not in (200, 201):
    print(f"Erro: {r.text}")
else:
    print(f"✅ Revisão #1 criada!")

# Atualizar projeto: status=sent, current_revision=1, sent_at=now
print("\n3. Atualizando status do projeto para 'sent'...")
r = requests.patch(
    f"{SUPABASE_URL}/rest/v1/approval_projects?id=eq.{project_id}",
    headers={**headers, "Prefer": "return=representation"},
    json={
        "status": "sent",
        "current_revision": 1,
        "sent_at": "now()",
    },
    timeout=30,
)
print(f"Status: {r.status_code}")

public_url = f"{SITE_URL}/aprovar/{token}"
print(f"\n{'='*60}")
print(f"✅ PROJETO CRIADO E ENVIADO COM SUCESSO!")
print(f"{'='*60}")
print(f"Cliente: Gessyca Lins")
print(f"WhatsApp: (81) 90940-57216")
print(f"Projeto: Site Versículo do Dia")
print(f"Preview: https://versiculododiaa.lovable.app")
print(f"Public URL: {public_url}")
print(f"Token: {token}")
print(f"{'='*60}")

# Gera link de WhatsApp com mensagem pré-preenchida
wa_message = f"""Olá Gessyca! Tudo bem? 👋

Seu site "Versículo do Dia" está pronto para revisão! 🎉

Acesse o portal de aprovação para:
✅ Visualizar o site completo
✅ Pedir ajustes (3 rodadas inclusas)
✅ Aprovar o projeto final

🔗 {public_url}

Qualquer dúvida, é só me chamar aqui no WhatsApp.

— Clodoaldo Silva"""

wa_url = f"https://wa.me/55819094057216?text={requests.utils.quote(wa_message)}"
print(f"\n📲 Link de WhatsApp para enviar à cliente:")
print(wa_url)
