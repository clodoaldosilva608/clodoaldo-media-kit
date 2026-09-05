/**
 * Telegram Bot API integration.
 *
 * Sends push notifications to Clodoaldo's Telegram when:
 *  - An abandoned cart becomes eligible for recovery (cron job)
 *  - A new paid order comes in (webhook)
 *  - A new briefing arrives
 *
 * Setup (one-time):
 *  1. Open Telegram → search @BotFather → /newbot
 *  2. Pick a name (e.g. "Clodoaldo Bot") and username (e.g. "clodoaldo_alerts_bot")
 *  3. BotFather replies with the bot token → save as TELEGRAM_BOT_TOKEN env var
 *  4. Open your bot in Telegram → /start → note your chat_id (use @userinfobot)
 *  5. Save chat_id as TELEGRAM_CHAT_ID env var
 *  6. Send a test message: curl -s "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=hi"
 *
 * Free tier: 30 messages/sec to one chat — way more than enough.
 */

interface TelegramMessage {
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
  disablePreview?: boolean;
  replyMarkup?: {
    inline_keyboard: Array<Array<{
      text: string;
      url?: string;
      callback_data?: string;
    }>>;
  };
}

export async function sendTelegram(message: TelegramMessage): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Telegram not configured — fail silently (don't break the cron)
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: message.text,
      disable_web_page_preview: message.disablePreview ?? true,
    };
    if (message.parseMode) body.parse_mode = message.parseMode;
    if (message.replyMarkup) body.reply_markup = JSON.stringify(message.replyMarkup);

    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[telegram] sendMessage failed:", resp.status, errText);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[telegram] error:", e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Sends a recovery notification with an inline WhatsApp button.
 * Returns true if the message was sent successfully.
 */
export async function notifyCartRecovery(input: {
  customerName: string;
  customerPhone: string;
  serviceSlug: string;
  totalCents: number;
  cartAgeMinutes: number;
  variant: string;
  waLink: string;
  checkoutLink: string;
}): Promise<boolean> {
  const total = (input.totalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const text = [
    `🛒 <b>Carrinho abandonado — recuperação</b>`,
    ``,
    `<b>Cliente:</b> ${escapeHtml(input.customerName)}`,
    `<b>WhatsApp:</b> ${escapeHtml(input.customerPhone)}`,
    `<b>Serviço:</b> ${escapeHtml(input.serviceSlug)}`,
    `<b>Valor:</b> ${total}`,
    `<b>Tempo:</b> ${input.cartAgeMinutes} min`,
    `<b>Variante:</b> ${input.variant.toUpperCase()}`,
    ``,
    `Clique no botão abaixo para enviar a mensagem de recuperação no WhatsApp:`,
  ].join("\n");

  return sendTelegram({
    text,
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [
          { text: "💬 Recuperar no WhatsApp", url: input.waLink },
          { text: "🔗 Ver checkout", url: input.checkoutLink },
        ],
      ],
    },
  });
}

/**
 * Sends a notification when a new paid order comes in.
 */
export async function notifyPaidOrder(input: {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  totalCents: number;
  orderId: string;
}): Promise<boolean> {
  const total = (input.totalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const text = [
    `💰 <b>Nova venda confirmada!</b>`,
    ``,
    `<b>Cliente:</b> ${escapeHtml(input.customerName)}`,
    `<b>Email:</b> ${escapeHtml(input.customerEmail)}`,
    `<b>Serviço:</b> ${escapeHtml(input.serviceName)}`,
    `<b>Valor:</b> ${total}`,
    `<b>Pedido:</b> <code>${input.orderId}</code>`,
  ].join("\n");

  return sendTelegram({ text, parseMode: "HTML" });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
