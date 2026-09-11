#!/usr/bin/env python3
"""Verifica tabelas P1 + insere 7 templates transacionais + dados de exemplo."""
import psycopg2, json, urllib.request

DATABASE_URL = "postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
VERCEL_URL = "https://clodoaldo.vercel.app"

print("=" * 60)
print("1) Verificando tabelas P1")
print("=" * 60)
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cur = conn.cursor()
cur.execute("""
  SELECT 'lead_tasks' AS t, COUNT(*) FROM lead_tasks
  UNION ALL SELECT 'lead_history', COUNT(*) FROM lead_history
  UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
  UNION ALL SELECT 'payment_events', COUNT(*) FROM payment_events
  UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
  UNION ALL SELECT 'orders', COUNT(*) FROM orders
  UNION ALL SELECT 'clodoaldo_prospects', COUNT(*) FROM clodoaldo_prospects
  UNION ALL SELECT 'pixel_config', COUNT(*) FROM pixel_config
""")
for row in cur.fetchall():
    print(f"  • {row[0]}: {row[1]} rows")

print()
print("=" * 60)
print("2) Inserindo 7 templates transacionais")
print("=" * 60)

templates = [
    ("welcome", "Boas-vindas (novo lead)", "Recebemos seu contato, {{nome}}! 🎉",
     "Obrigado pelo interesse — em breve entrarei em contato.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Obrigado pelo seu interesse em meus serviços de criação de sites e presença digital. Recebi seus dados e em até <strong>24 horas úteis</strong> entrarei em contato pelo WhatsApp.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("briefing_received", "Confirmação de briefing", "Briefing recebido! (#{{briefing_id}})",
     "Seu briefing foi registrado.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Confirmei o recebimento do seu briefing (<strong>#{{briefing_id}}</strong>). Em até <strong>48 horas</strong> envio uma proposta personalizada.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("abandoned_cart", "Carrinho abandonado", "{{nome}}, seu carrinho ainda está salvo 🛒",
     "Finalize em 5 minutos.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Notei que você iniciou o checkout do serviço <strong>{{servico}}</strong> mas não finalizou.</p><p style="text-align:center;margin:24px 0;"><a href="{{checkout_url}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Retomar checkout →</a></p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("purchase_confirmed", "Confirmação de compra", "Pagamento confirmado! 🎉 (#{{order_id}})",
     "Recebemos seu pagamento para {{servico}}.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Confirmamos o recebimento do seu pagamento de <strong>{{valor}}</strong> para o serviço <strong>{{servico}}</strong>.</p><p><strong>Próximos passos:</strong> Você receberá um link de briefing em até 1h.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("digital_delivery", "Entrega de produto digital", "Seu acesso está liberado! 📚",
     "Download/links para {{servico}}.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Seu produto digital <strong>{{servico}}</strong> está disponível!</p><p style="text-align:center;margin:24px 0;"><a href="{{link}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Acessar conteúdo →</a></p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("status_update", "Mudança de status", "Atualização do seu projeto: {{status}}",
     "O status foi atualizado.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Atualização sobre seu projeto <strong>{{servico}}</strong>:</p><p style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center;font-weight:bold;font-size:18px;color:#10b981;">Status atual: {{status}}</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
    ("lead_no_response", "Lead sem resposta (7 dias)", "Ainda posso te ajudar, {{nome}}? 💬",
     "Faz {{dias_sem_resposta}} dias que não falamos.",
     '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Faz <strong>{{dias_sem_resposta}} dias</strong> que não temos contato. Se quiser retomar, é só responder este email.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
     True),
]

inserted = 0
skipped = 0
for t in templates:
    trigger, name, subject, preheader, body_html, active = t
    cur.execute("SELECT id FROM email_templates WHERE trigger = %1".replace("%1","%s"), (trigger,))
    if cur.fetchone():
        skipped += 1
        print(f"  ⏭️  {name} (já existe)")
        continue
    cur.execute(
        "INSERT INTO email_templates (name, subject, preheader, body_html, trigger, active, created_at) VALUES (%s,%s,%s,%s,%s,%s,now())",
        (name, subject, preheader, body_html, trigger, active)
    )
    inserted += 1
    print(f"  ✅ {name}")

print(f"\n  Total: {inserted} inseridos, {skipped} já existiam")

print()
print("=" * 60)
print("3) Inserindo eventos de auditoria de exemplo")
print("=" * 60)

sample_logs = [
    ("clodoaldo608@gmail.com", "admin", "login", "auth", None, {"ip":"201.81.x.x","user_agent":"Chrome/SaoPaulo"}),
    ("clodoaldo608@gmail.com", "admin", "view_page", "admin", None, {"page":"/admin/analytics"}),
    ("clodoaldo608@gmail.com", "admin", "view_page", "admin", None, {"page":"/admin/orders"}),
    ("clodoaldo608@gmail.com", "admin", "view_page", "admin", None, {"page":"/admin/health"}),
    ("clodoaldo608@gmail.com", "admin", "view_page", "admin", None, {"page":"/admin/financeiro"}),
    ("clodoaldo608@gmail.com", "admin", "view_page", "admin", None, {"page":"/admin/auditoria"}),
    ("clodoaldo608@gmail.com", "admin", "role_change", "user_roles", None, {"email":"clodoaldo608@gmail.com","role":"admin","note":"self-role confirmed"}),
    ("system", "system", "weekly_report_sent", "cron", None, {"period":"7d","emails_sent":1,"telegram_sent":True}),
    ("clodoaldo608@gmail.com", "admin", "config_update", "settings", None, {"key":"pix_keys","action":"mask_enabled"}),
    ("clodoaldo608@gmail.com", "admin", "export_csv", "orders", None, {"rows":0,"filter":"all"}),
]

for log in sample_logs:
    cur.execute(
        "INSERT INTO audit_logs (actor, actor_role, action, entity, entity_id, details, created_at) VALUES (%s,%s,%s,%s,%s,%s,now())",
        (log[0], log[1], log[2], log[3], log[4], json.dumps(log[5]))
    )
print(f"  ✅ {len(sample_logs)} logs inseridos (exemplo para visualização)")

print()
print("=" * 60)
print("4) Inserindo 1 evento de pagamento de exemplo (para reconciliação)")
print("=" * 60)

# Check if any orders exist first
cur.execute("SELECT id, total_cents FROM orders LIMIT 1")
order = cur.fetchone()
if order:
    order_id, total = order
    cur.execute("""
        INSERT INTO payment_events (gateway, event_id, order_id, status, amount_cents, currency, signature_valid, received_at)
        VALUES ('kiwify', %s, %s, 'paid', %s, 'BRL', true, now())
        ON CONFLICT (event_id) DO NOTHING
    """, (f"evt_test_{order_id[:8]}", order_id, total))
    print(f"  ✅ Evento 'paid' inserido para order {order_id[:8]}")
else:
    # Insert a test payment without order to demonstrate "payments_without_order"
    cur.execute("""
        INSERT INTO payment_events (gateway, event_id, order_id, status, amount_cents, currency, signature_valid, received_at)
        VALUES ('kiwify', 'evt_orphan_test_001', NULL, 'paid', 29700, 'BRL', true, now())
        ON CONFLICT (event_id) DO NOTHING
    """)
    print(f"  ✅ Evento órfão de exemplo inserido (sem order_id — vai aparecer como 'payments_without_order')")

print()
print("=" * 60)
print("5) Resultado final — contagens")
print("=" * 60)
cur.execute("""
  SELECT 'lead_tasks' AS t, COUNT(*) FROM lead_tasks
  UNION ALL SELECT 'lead_history', COUNT(*) FROM lead_history
  UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
  UNION ALL SELECT 'payment_events', COUNT(*) FROM payment_events
  UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
""")
for row in cur.fetchall():
    print(f"  • {row[0]}: {row[1]} rows")

cur.close()
conn.close()
print("\n✅ Tudo pronto. Abra no admin:")
print("   /admin/health       — ver status")
print("   /admin/financeiro   — ver reconciliação")
print("   /admin/auditoria    — ver logs")
print("   /admin/email        — ver 7 templates")
