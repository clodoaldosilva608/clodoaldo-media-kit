import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const entitlementIdSchema = z.string().uuid();
const stripeIdSchema = z.string().min(3).max(255);

/**
 * Structured, single-line JSON logs so every webhook event is traceable.
 * Never include PII (e-mails, names) or tokens in `details`.
 */
type Outcome = "received" | "processed" | "ignored" | "denied";

function emit(outcome: Outcome, event: string, details: Record<string, unknown> = {}) {
  const payload = JSON.stringify({
    source: "stripe-webhook",
    outcome,
    event,
    ts: new Date().toISOString(),
    ...details,
  });
  if (outcome === "denied") console.error(payload);
  else console.info(payload);
}

function logWebhook(message: string, details: Record<string, unknown> = {}) {
  emit(message === "event ignored" ? "ignored" : "processed", message, details);
}

/** Denial with a canonical, greppable reason code. */
type DenyReason =
  | "missing_configuration"
  | "missing_signature"
  | "payload_too_large"
  | "signature_invalid"
  | "idempotency_error"
  | "replay_ignored"
  | "payment_not_paid"
  | "entitlement_read_failed"
  | "entitlement_not_found"
  | "entitlement_user_mismatch"
  | "entitlement_product_mismatch"
  | "amount_mismatch"
  | "entitlement_update_failed"
  | "invalid_session_id"
  | "invalid_supporter_id"
  | "supporter_update_failed"
  | "order_update_failed"
  | "unhandled_error";

function logWebhookError(reason: DenyReason | string, details: Record<string, unknown> = {}) {
  emit("denied", "denied", { deny_reason: reason, ...details });
}


export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripeKey || !webhookSecret) {
          logWebhookError("missing_configuration");
          return new Response("Stripe not configured", { status: 503 });
        }
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          logWebhookError("missing_signature");
          return new Response("Missing signature", { status: 400 });
        }
        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength > 1_048_576) {
          return new Response("Payload too large", { status: 413 });
        }
        const body = await request.text();
        if (body.length > 1_048_576) {
          logWebhookError("payload_too_large", { bodyLength: body.length });
          return new Response("Payload too large", { status: 413 });
        }

        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as never });

        let event: import("stripe").Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (error) {
          logWebhookError("signature_invalid", { message: error instanceof Error ? error.message : "unknown" });
          return new Response("Invalid signature", { status: 401 });
        }

        emit("received", "event_received", { eventId: event.id, eventType: event.type, idempotencyKey: event.id });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // ---- Idempotency guard: refuse to process the same event twice ----
        const { error: insErr } = await supabaseAdmin
          .from("stripe_webhook_events")
          .insert({ event_id: event.id, event_type: event.type });
        if (insErr) {
          // Unique-violation → replay: acknowledge without reprocessing.
          if ((insErr as { code?: string }).code === "23505") {
            emit("ignored", "replay_ignored", { eventId: event.id, eventType: event.type, idempotencyKey: event.id });
            return new Response("ok", { status: 200 });
          }
          logWebhookError("idempotency_error", { eventId: event.id, message: insErr.message });
          return new Response("Idempotency error", { status: 500 });
        }

        async function releaseIdempotencyLock() {
          await supabaseAdmin.from("stripe_webhook_events").delete().eq("event_id", event.id);
        }

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as {
              id: string;
              payment_intent?: string;
              subscription?: string;
              payment_status?: string;
              amount_total?: number | null;
              currency?: string | null;
              metadata?: Record<string, string>;
            };
            const paymentIntent =
              typeof session.payment_intent === "string" ? session.payment_intent : null;
            const kind = session.metadata?.kind;

            logWebhook("checkout completed", {
              eventId: event.id,
              sessionId: session.id,
              paymentStatus: session.payment_status,
              amountTotal: session.amount_total,
              currency: session.currency,
              kind: kind ?? "orders",
              entitlementId: session.metadata?.entitlement_id ?? null,
              orderId: session.metadata?.order_id ?? null,
              supporterId: session.metadata?.supporter_id ?? null,
            });

            if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
              logWebhookError("payment_not_paid", { sessionId: session.id, paymentStatus: session.payment_status });
              // Not a failure to Stripe — acknowledge; the async payment_succeeded event will finalize.
              return new Response("ok", { status: 200 });
            }

            if (kind === "knowledge") {
              const parsedEntitlementId = entitlementIdSchema.safeParse(session.metadata?.entitlement_id);
              const metaUserId = session.metadata?.user_id;
              const metaKnowledgeId = session.metadata?.knowledge_id ?? null;
              const metaBundleId = session.metadata?.bundle_id ?? null;

              if (parsedEntitlementId.success) {
                const entitlementId = parsedEntitlementId.data;
                // Fetch pending entitlement and validate ownership + product match.
                const { data: pending, error: readErr } = await supabaseAdmin
                  .from("knowledge_entitlements")
                  .select("id, user_id, knowledge_id, bundle_id, active")
                  .eq("id", entitlementId)
                  .maybeSingle();
                if (readErr) {
                  logWebhookError("entitlement_read_failed", { sessionId: session.id, entitlementId, message: readErr.message });
                  await releaseIdempotencyLock();
                  return new Response("Entitlement read failed", { status: 500 });
                }
                if (!pending) {
                  logWebhookError("entitlement_not_found", { sessionId: session.id, entitlementId });
                  await releaseIdempotencyLock();
                  return new Response("Entitlement not found", { status: 404 });
                }
                if (metaUserId && pending.user_id !== metaUserId) {
                  logWebhookError("entitlement_user_mismatch", { sessionId: session.id, entitlementId, expected: metaUserId, actual: pending.user_id });
                  return new Response("Ownership mismatch", { status: 409 });
                }
                if (metaKnowledgeId && pending.knowledge_id !== metaKnowledgeId) {
                  logWebhookError("entitlement_product_mismatch", { sessionId: session.id, entitlementId });
                  return new Response("Product mismatch", { status: 409 });
                }
                if (metaBundleId && pending.bundle_id !== metaBundleId) {
                  logWebhookError("entitlement_product_mismatch", { sessionId: session.id, entitlementId });
                  return new Response("Product mismatch", { status: 409 });
                }

                // Validate paid amount matches item price on record.
                if (typeof session.amount_total === "number") {
                  const priceQuery = pending.knowledge_id
                    ? supabaseAdmin.from("knowledge_items").select("price_cents, currency").eq("id", pending.knowledge_id).maybeSingle()
                    : pending.bundle_id
                      ? supabaseAdmin.from("knowledge_bundles").select("price_cents, currency").eq("id", pending.bundle_id).maybeSingle()
                      : Promise.resolve({ data: null, error: null } as const);
                  const { data: product } = await priceQuery;
                  if (product && (product.price_cents !== session.amount_total || (session.currency && product.currency.toLowerCase() !== session.currency.toLowerCase()))) {
                    logWebhookError("amount_mismatch", {
                      sessionId: session.id,
                      entitlementId,
                      expectedCents: product.price_cents,
                      paidCents: session.amount_total,
                      expectedCurrency: product.currency,
                      paidCurrency: session.currency,
                    });
                    return new Response("Amount mismatch", { status: 409 });
                  }
                }

                const { data: updated, error } = await supabaseAdmin
                  .from("knowledge_entitlements")
                  .update({ active: true, stripe_session_id: session.id, stripe_payment_intent: paymentIntent })
                  .eq("id", entitlementId)
                  .select("id, knowledge_id, bundle_id, active")
                  .maybeSingle();
                if (error || !updated) {
                  logWebhookError("entitlement_update_failed", { sessionId: session.id, entitlementId, message: error?.message });
                  await releaseIdempotencyLock();
                  return new Response("Entitlement update failed", { status: 500 });
                }
                logWebhook("entitlement activated", { sessionId: session.id, entitlementId: updated.id, knowledgeId: updated.knowledge_id, bundleId: updated.bundle_id });
              } else {
                // Fallback: match by session id
                const parsedSessionId = stripeIdSchema.safeParse(session.id);
                if (!parsedSessionId.success) {
                  logWebhookError("invalid_session_id", { sessionId: session.id });
                  await releaseIdempotencyLock();
                  return new Response("Invalid session id", { status: 400 });
                }
                const { data: updated, error } = await supabaseAdmin
                  .from("knowledge_entitlements")
                  .update({ active: true, stripe_payment_intent: paymentIntent })
                  .eq("stripe_session_id", parsedSessionId.data)
                  .select("id, knowledge_id, bundle_id, active");
                if (error) {
                  logWebhookError("entitlement_update_failed", { sessionId: session.id, message: error.message });
                  await releaseIdempotencyLock();
                  return new Response("Entitlement update failed", { status: 500 });
                }
                if (!updated || updated.length === 0) {
                  logWebhookError("entitlement_not_found", { sessionId: session.id });
                  await releaseIdempotencyLock();
                  return new Response("Entitlement not found", { status: 404 });
                }
                logWebhook("fallback entitlement activated", { sessionId: session.id, count: updated.length });
              }
            } else if (kind === "funding") {
              const supporterId = entitlementIdSchema.safeParse(session.metadata?.supporter_id);
              if (!supporterId.success) {
                logWebhookError("invalid_supporter_id", { sessionId: session.id });
                await releaseIdempotencyLock();
                return new Response("Invalid supporter id", { status: 400 });
              }
              const { error } = await supabaseAdmin
                .from("supporters")
                .update({ status: "paid", stripe_payment_intent: paymentIntent })
                .eq("id", supporterId.data);
              if (error) {
                logWebhookError("supporter_update_failed", { sessionId: session.id, supporterId: supporterId.data, message: error.message });
                await releaseIdempotencyLock();
                return new Response("Supporter update failed", { status: 500 });
              }
              logWebhook("supporter marked paid", { sessionId: session.id, supporterId: supporterId.data });
            } else {
              const orderId = entitlementIdSchema.safeParse(session.metadata?.order_id);
              const query = supabaseAdmin
                .from("orders")
                .update({ status: "paid", stripe_payment_intent: paymentIntent })
                .select("id, queue_id");
              const { data: updatedOrders, error } = orderId.success
                ? await query.eq("id", orderId.data)
                : await query.eq("stripe_session_id", session.id);
              if (error) {
                logWebhookError("order_update_failed", { sessionId: session.id, orderId: orderId.success ? orderId.data : null, message: error.message });
                await releaseIdempotencyLock();
                return new Response("Order update failed", { status: 500 });
              }
              logWebhook("order marked paid", { sessionId: session.id, orderId: orderId.success ? orderId.data : null });

              const queueId = updatedOrders?.[0]?.queue_id ?? null;
              if (queueId) {
                const { error: queueErr } = await supabaseAdmin
                  .from("service_queue")
                  .update({ status: "paid" })
                  .eq("id", queueId);
                if (queueErr) {
                  logWebhookError("queue_update_failed", { sessionId: session.id, queueId, message: queueErr.message });
                } else {
                  logWebhook("queue slot confirmed", { sessionId: session.id, queueId });
                }
              }
            }
          } else {
            logWebhook("event ignored", { eventId: event.id, eventType: event.type });
          }

          return new Response("ok", { status: 200 });
        } catch (error) {
          logWebhookError("unhandled_error", { eventId: event.id, message: error instanceof Error ? error.message : "unknown" });
          await releaseIdempotencyLock();
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});
