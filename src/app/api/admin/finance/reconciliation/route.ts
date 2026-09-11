import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/finance/reconciliation
 *
 * Reconciliação financeira — auditoria P1-6.
 * Compara pedidos locais com eventos do gateway (payment_events).
 *
 * Retorna:
 *   - orders_without_payment: pedidos sem evento de pagamento correspondente
 *   - payments_without_order: eventos sem pedido local
 *   - status_mismatches: pedido "paid" mas gateway não confirmou (ou vice-versa)
 *   - amount_mismatches: valor do pedido ≠ valor do pagamento
 *   - duplicate_payments: mesmo order_id com 2+ eventos "paid"
 */
export async function GET() {
  try {
    const pool = getMeucorrePool();
    if (!pool) return NextResponse.json({ error: "DB indisponível" }, { status: 503 });

    // 1) Pedidos sem pagamento correspondente
    const noPay = await pool.query(`
      SELECT o.id, o.service_slug, o.service_name, o.customer_email, o.total_cents, o.status, o.created_at
      FROM orders o
      LEFT JOIN payment_events p ON p.order_id = o.id
      WHERE p.id IS NULL
      ORDER BY o.created_at DESC LIMIT 100
    `);

    // 2) Pagamentos sem pedido local
    const noOrder = await pool.query(`
      SELECT p.id, p.gateway, p.event_id, p.order_id, p.status, p.amount_cents, p.received_at, p.signature_valid
      FROM payment_events p
      LEFT JOIN orders o ON o.id = p.order_id
      WHERE o.id IS NULL
      ORDER BY p.received_at DESC LIMIT 100
    `);

    // 3) Status mismatches
    const mismatches = await pool.query(`
      SELECT o.id AS order_id, o.service_slug, o.customer_email, o.total_cents,
             o.status AS order_status,
             p.status AS payment_status, p.gateway, p.received_at
      FROM orders o
      JOIN payment_events p ON p.order_id = o.id
      WHERE (o.status = 'paid' AND p.status NOT IN ('paid','captured'))
         OR (o.status <> 'paid' AND p.status IN ('paid','captured'))
      ORDER BY p.received_at DESC LIMIT 100
    `);

    // 4) Amount mismatches
    const amountMismatch = await pool.query(`
      SELECT o.id AS order_id, o.service_slug, o.total_cents AS order_cents,
             p.amount_cents AS payment_cents, p.gateway, p.received_at
      FROM orders o
      JOIN payment_events p ON p.order_id = o.id
      WHERE p.status IN ('paid','captured')
        AND o.total_cents > 0
        AND ABS(o.total_cents - p.amount_cents) > 1
      ORDER BY p.received_at DESC LIMIT 100
    `);

    // 5) Duplicate payments
    const dupes = await pool.query(`
      SELECT order_id, COUNT(*)::int AS paid_count,
             array_agg(event_id) AS event_ids,
             array_agg(received_at) AS received_ats
      FROM payment_events
      WHERE status IN ('paid','captured')
      GROUP BY order_id
      HAVING COUNT(*) > 1
      ORDER BY MAX(received_at) DESC LIMIT 100
    `);

    return NextResponse.json({
      summary: {
        orders_without_payment: noPay.rowCount || 0,
        payments_without_order: noOrder.rowCount || 0,
        status_mismatches: mismatches.rowCount || 0,
        amount_mismatches: amountMismatch.rowCount || 0,
        duplicate_payments: dupes.rowCount || 0,
      },
      orders_without_payment: noPay.rows,
      payments_without_order: noOrder.rows,
      status_mismatches: mismatches.rows,
      amount_mismatches: amountMismatch.rows,
      duplicate_payments: dupes.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
