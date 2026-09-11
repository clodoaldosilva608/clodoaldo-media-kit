import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/finance/reconciliation
 *
 * Compara orders locais com payment_events.
 * Ambos estão no mesmo banco (Supabase main).
 *
 * Retorna:
 *   - orders_without_payment
 *   - payments_without_order
 *   - status_mismatches
 *   - amount_mismatches
 *   - duplicate_payments
 */
function getServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  try {
    const sb: any = getServer();

    const [ordersR, paymentsR] = await Promise.all([
      sb.from("orders").select("id,service_slug,service_name,customer_email,customer_name,total_cents,status,created_at").order("created_at", { ascending: false }).limit(500),
      sb.from("payment_events").select("id,gateway,event_id,order_id,status,amount_cents,received_at,signature_valid").order("received_at", { ascending: false }).limit(500),
    ]);

    if (ordersR.error) throw ordersR.error;
    if (paymentsR.error) throw paymentsR.error;

    const orders = ordersR.data || [];
    const payments = paymentsR.data || [];
    const orderIds = new Set(orders.map((o: any) => o.id));
    const paymentsByOrder: Record<string, any[]> = {};
    payments.forEach((p: any) => {
      const k = p.order_id || "(orphan)";
      if (!paymentsByOrder[k]) paymentsByOrder[k] = [];
      paymentsByOrder[k].push(p);
    });

    const orders_without_payment = orders.filter((o: any) => !paymentsByOrder[o.id] || paymentsByOrder[o.id].length === 0);
    const payments_without_order = payments.filter((p: any) => p.order_id && !orderIds.has(p.order_id));

    const status_mismatches: any[] = [];
    const amount_mismatches: any[] = [];
    const duplicate_payments: any[] = [];

    for (const [orderId, evs] of Object.entries(paymentsByOrder)) {
      if (orderId === "(orphan)") continue;
      const order = orders.find((o: any) => o.id === orderId);
      if (!order) continue;

      for (const p of evs) {
        if (p.status === "paid" || p.status === "captured") {
          if (order.status !== "paid") {
            status_mismatches.push({
              order_id: orderId,
              service_slug: order.service_slug,
              customer_email: order.customer_email,
              total_cents: order.total_cents,
              order_status: order.status,
              payment_status: p.status,
              gateway: p.gateway,
              received_at: p.received_at,
            });
          }
          if (order.total_cents > 0 && Math.abs(order.total_cents - (p.amount_cents || 0)) > 1) {
            amount_mismatches.push({
              order_id: orderId,
              service_slug: order.service_slug,
              order_cents: order.total_cents,
              payment_cents: p.amount_cents,
              gateway: p.gateway,
              received_at: p.received_at,
            });
          }
        }
      }

      const paidCount = evs.filter((p: any) => p.status === "paid" || p.status === "captured").length;
      if (paidCount > 1) {
        duplicate_payments.push({
          order_id: orderId,
          paid_count: paidCount,
          event_ids: evs.map((p: any) => p.event_id),
          received_ats: evs.map((p: any) => p.received_at),
        });
      }
    }

    return NextResponse.json({
      summary: {
        orders_without_payment: orders_without_payment.length,
        payments_without_order: payments_without_order.length,
        status_mismatches: status_mismatches.length,
        amount_mismatches: amount_mismatches.length,
        duplicate_payments: duplicate_payments.length,
      },
      orders_without_payment,
      payments_without_order,
      status_mismatches,
      amount_mismatches,
      duplicate_payments,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
