import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * POST /api/webhook-asaas
 *
 * Webhook do Asaas — recebe notificações de pagamento PIX.
 * Quando pagamento é confirmado (status=RECEIVED):
 * 1. Atualiza order status = 'paid' (via external_reference = order_id)
 * 2. Dispara email de confirmação (se Gmail conectado)
 * 3. Notifica via Telegram
 * 4. Cria payment_event na tabela payment_events
 *
 * Segurança: valida ASAAS_WEBHOOK_TOKEN no header
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const webhookToken = req.headers.get("asaas-access-token") || body?.eventToken;

    if (!webhookToken || webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = body?.event;
    const payment = body?.payment;

    if (!payment) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const sb: any = getSupabaseServer();

    // Registra evento em payment_events
    await sb.from("payment_events").insert({
      gateway: "asaas",
      event_id: payment.id || body?.id,
      order_id: payment.externalReference || null,
      status: payment.status?.toLowerCase() || "unknown",
      amount_cents: Math.round((payment.value || 0) * 100),
      raw_payload: body,
      signature_valid: true,
      received_at: new Date().toISOString(),
    });

    // Só processa se for pagamento confirmado
    if (event !== "PAYMENT_RECEIVED" && payment.status !== "RECEIVED" && payment.status !== "CONFIRMED") {
      return NextResponse.json({ ok: true, status: payment.status, ignored: true });
    }

    // Busca order pelo external_reference
    const orderId = payment.externalReference;
    if (orderId) {
      // Atualiza order
      const { data: order } = await sb.from("orders")
        .select("id, customer_name, customer_email, service_slug, service_name, total_cents")
        .eq("id", orderId)
        .maybeSingle();

      if (order) {
        await sb.from("orders")
          .update({
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        // Dispara email de confirmação (se Gmail conectado)
        try {
          const { getConnectedEmail } = await import("@/lib/google-oauth");
          const { sendEmail } = await import("@/lib/gmail");
          const dest = await getConnectedEmail();

          if (dest && order.customer_email) {
            const html = `
              <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;">
                <div style="background:linear-gradient(135deg,#10b981,#0ea5e9);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
                  <h1 style="margin:0;font-size:22px;">✅ Pagamento confirmado!</h1>
                </div>
                <div style="background:#f5f5f5;padding:20px;border-radius:0 0 16px 16px;">
                  <p style="font-size:14px;color:#333;">Olá <strong>${order.customer_name}</strong>,</p>
                  <p style="font-size:14px;color:#333;">Seu pagamento de <strong>R$ ${(order.total_cents / 100).toFixed(2)}</strong> foi confirmado!</p>
                  <p style="font-size:14px;color:#333;">Produto: <strong>${order.service_name}</strong></p>
                  <p style="font-size:14px;color:#333;">Próximos passos: vou entrar em contato pelo WhatsApp em até 24h pra iniciar o projeto.</p>
                </div>
              </div>
            `;
            await sendEmail(order.customer_email, `✅ Pagamento confirmado — ${order.service_name}`, html);
          }
        } catch {}

        // Notifica Telegram
        const valor = (payment.value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        await sendTelegram({
          text: `💰 <b>Pagamento confirmado via Asaas!</b>\n\nCliente: <b>${escapeHtml(order.customer_name)}</b>\nProduto: ${escapeHtml(order.service_name)}\nValor: <b>${valor}</b>\nOrder: <code>${orderId.slice(0, 8)}</code>\n\n✅ Order atualizada para 'paid' automaticamente.`,
          parseMode: "HTML",
        });

        // Dispara evento de purchase (analytics)
        try {
          await fetch("https://clodoaldo-media-kit.vercel.app/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "purchase",
              path: "/webhook-asaas",
              props: { offer_slug: order.service_slug, value: order.total_cents },
            }),
          });
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, event, payment_id: payment.id });
  } catch (e: any) {
    console.error("[webhook-asaas] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
