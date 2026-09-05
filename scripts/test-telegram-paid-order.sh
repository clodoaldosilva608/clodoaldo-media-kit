#!/usr/bin/env bash
# Simula uma notificação de venda para validar o fluxo Telegram.
# Não insere nada no banco — só testa o sendTelegram diretamente.

TOKEN="8812664690:AAGkELtChRMJMLbVlLhPjzZwWHX6-HH7Gos"
CHAT_ID="802516531"

curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": '"${CHAT_ID}"',
    "text": "💰 <b>Nova venda confirmada!</b>\n\n<b>Cliente:</b> Cliente Teste\n<b>Email:</b> teste@exemplo.com\n<b>Serviço:</b> roteiro estratégico\n<b>Valor:</b> R$ 497,00\n<b>Pedido:</b> <code>test-order-001</code>\n\n<i>(Mensagem de teste — simulando webhook Kiwify)</i>",
    "parse_mode": "HTML",
    "disable_web_page_preview": true,
    "reply_markup": "{\"inline_keyboard\":[[{\"text\":\"✅ Confirmar\",\"url\":\"https://clodoaldo.vercel.app/admin/orders\"}]]}"
  }'
echo ""
