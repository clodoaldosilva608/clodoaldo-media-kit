import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabase-server";
import { verifyKiwifyWebhookSignature } from "@/lib/kiwify";
import { notifyPaidOrder } from "@/lib/telegram";

/**
 * Webhook da Kiwify — recebe notificações de pagamento.
 *
 * Configurar no painel Kiwify:
 *   URL: https://clodoaldo-media-kit.vercel.app/api/webhook-kiwify
 *   Método: POST
 *   Secret: o valor de KIWIFY_WEBHOOK_SECRET (env var)
 *
 * Eventos tratados:
 *   - payment.paid → marca order/supporter como "paid"
 *   - payment.refunded → marca como "refunded"
 *   - payment.failed → marca como "failed" (não confirma)
 *
 * Idempotência: usa a tabela `stripe_webhook_events` (mesma do Stripe, mas
 * funciona para Kiwify também — o evento_id é o ID do evento Kiwify).
 */

interface KiwifyWebhookPayload {
  id?: string;
  event?: string;
  type?: string;
  status?: string;
  order_id?: string;
  reference?: string;
  customer?: { email?: string; name?: string };
  product?: { id?: string };
  amount?: number | string;
  currency?: string;
  metadata?: Record<string, string>;
}

function emit(outcome: string, event: string, details: Record<string, unknown> = {}) {
  const payload = JSON.stringify({
    source: "kiwify-webhook",
    outcome,
    event,
    ts: new Date().toISOString(),
    ...details,
  });
  if (outcome === "denied") console.error(payload);
  else console.info(payload);
}

export async function POST(req: NextRequest) {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;

  if (!secret) {
    emit("denied", "missing_configuration");
    return NextResponse.json({ error: "Kiwify not configured" }, { status: 503 });
  }

  // Kiwify envia o token de várias formas:
  // 1. Header x-kiwify-token
  // 2. Header x-kiwify-signature
  // 3. Query param ?token=xxx
  // 4. No body JSON como campo "token"
  const signature =
    req.headers.get("x-kiwify-token") ||
    req.headers.get("x-kiwify-signature") ||
    req.headers.get("x-signature") ||
    new URL(req.url).searchParams.get("token");

  const body = await req.text();

  // Também verificar se o token está no body JSON
  let bodyToken: string | null = null;
  try {
    const parsed = JSON.parse(body);
    bodyToken = parsed?.token || null;
  } catch {
    // não é JSON, ok
  }

  const tokenToCheck = signature || bodyToken;

  // Always use constant-time comparison — never string equality (avoids timing attacks)
  if (!tokenToCheck) {
    emit("denied", "missing_signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  // Constant-time direct secret comparison
  let directMatch = false;
  try {
    const sigBuf = Buffer.from(tokenToCheck);
    const secBuf = Buffer.from(secret);
    if (sigBuf.length === secBuf.length) {
      directMatch = crypto.timingSafeEqual(sigBuf, secBuf);
    }
  } catch {}

  if (!directMatch) {
    // Try HMAC verification
    if (!verifyKiwifyWebhookSignature(body, tokenToCheck, secret)) {
      emit("denied", "signature_invalid", {
        has_sig: !!tokenToCheck,
        sig_preview: tokenToCheck ? tokenToCheck.slice(0, 12) + "..." : null,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: KiwifyWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    emit("denied", "invalid_json");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId =
    payload.id ||
    payload.reference ||
    `${payload.event || payload.type || "event"}-${payload.order_id || Date.now()}`;
  const eventType = payload.event || payload.type || "payment.updated";
  const status = payload.status || eventType.split(".").pop() || "";

  emit("received", "event_received", { eventId, eventType, status });

  const sb = getSupabaseServer();

  // Idempotency guard
  const { error: insErr } = await sb
    .from("stripe_webhook_events")
    .insert({ event_id: eventId, event_type: eventType });

  if (insErr) {
    if ((insErr as { code?: string }).code === "23505") {
      // Replay — já processado
      emit("ignored", "replay_ignored", { eventId });
      return NextResponse.json({ ok: true, replay: true });
    }
    emit("denied", "idempotency_error", { eventId, message: insErr.message });
    return NextResponse.json({ error: "Idempotency error" }, { status: 500 });
  }

  async function releaseLock() {
    await sb.from("stripe_webhook_events").delete().eq("event_id", eventId);
  }

  try {
    // Só confirma se status === "paid" (ou "approved" / "completed")
    const isPaid =
      status === "paid" ||
      status === "approved" ||
      status === "completed" ||
      eventType === "payment.paid" ||
      eventType === "order.paid";

    if (!isPaid) {
      emit("ignored", "event_ignored", { eventId, eventType, status });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const metadata = payload.metadata || {};
    const orderId = metadata.order_id || payload.order_id || payload.reference;
    const supporterId = metadata.supporter_id;
    const kind = metadata.kind || "orders";

    if (kind === "funding" && supporterId) {
      // Atualiza supporter
      const { error } = await sb
        .from("supporters")
        .update({ status: "paid" })
        .eq("id", supporterId);

      if (error) {
        emit("denied", "supporter_update_failed", { supporterId, message: error.message });
        await releaseLock();
        return NextResponse.json({ error: "Supporter update failed" }, { status: 500 });
      }

      emit("processed", "supporter_marked_paid", { supporterId, eventId });
      return NextResponse.json({ ok: true });
    }

    // Default: atualiza order
    if (orderId) {
      const { data: updatedOrders, error } = await sb
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId)
        .select("id, queue_id");

      if (error) {
        emit("denied", "order_update_failed", { orderId, message: error.message });
        await releaseLock();
        return NextResponse.json({ error: "Order update failed" }, { status: 500 });
      }

      if (updatedOrders && updatedOrders.length > 0) {
        const queueId = updatedOrders[0].queue_id;
        if (queueId) {
          await sb.from("service_queue").update({ status: "paid" }).eq("id", queueId);
        }

        // Telegram notification — push "💰 Nova venda!" to Clodoaldo
        try {
          const { data: orderRow } = await sb
            .from("orders")
            .select("service_name, customer_name, customer_email, total_cents")
            .eq("id", orderId)
            .maybeSingle();
          if (orderRow) {
            await notifyPaidOrder({
              customerName: orderRow.customer_name || "(sem nome)",
              customerEmail: orderRow.customer_email || "",
              serviceName: orderRow.service_name || "",
              totalCents: orderRow.total_cents || 0,
              orderId,
            });
          }
        } catch {
          // Telegram failure must not block webhook ACK
        }

        emit("processed", "order_marked_paid", { orderId, eventId, queueId });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    emit("denied", "unhandled_error", {
      eventId,
      message: error instanceof Error ? error.message : "unknown",
    });
    await releaseLock();
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  // Health check — útil para verificar se o endpoint existe
  return NextResponse.json({
    ok: true,
    endpoint: "kiwify-webhook",
    configured: !!process.env.KIWIFY_WEBHOOK_SECRET,
  });
}
