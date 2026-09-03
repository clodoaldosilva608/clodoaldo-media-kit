import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/stats
 * Returns aggregate stats for the admin overview.
 * Requires service_role (server-side only, never exposed).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Period
    const period = (req.nextUrl.searchParams.get("period") as "today" | "week" | "month" | "all") || "week";
    const now = new Date();
    const start = new Date(now);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "week") start.setDate(start.getDate() - 7);
    else if (period === "month") start.setDate(start.getDate() - 30);
    else start.setFullYear(2000);

    const [orders, leads, briefings, queue, subscribers] = await Promise.all([
      supabase.from("orders").select("*").gte("created_at", start.toISOString()),
      supabase.from("quiz_leads").select("*").gte("created_at", start.toISOString()),
      supabase.from("service_requests").select("*").gte("created_at", start.toISOString()),
      supabase.from("service_queue").select("*"),
      supabase.from("email_subscribers").select("*"),
    ]);

    const paidOrders = (orders.data || []).filter((o: any) => o.status === "paid");
    const revenueCents = paidOrders.reduce((s: number, o: any) => s + (o.total_cents || 0), 0);
    const pendingCents = (orders.data || [])
      .filter((o: any) => o.status === "pending")
      .reduce((s: number, o: any) => s + (o.total_cents || 0), 0);

    return NextResponse.json({
      period,
      orders: orders.data?.length || 0,
      paid_orders: paidOrders.length,
      revenue_cents: revenueCents,
      pending_cents: pendingCents,
      leads: leads.data?.length || 0,
      briefings: briefings.data?.length || 0,
      queue_total: queue.data?.length || 0,
      queue_waiting: (queue.data || []).filter((q: any) => q.status === "waiting").length,
      subscribers: subscribers.data?.length || 0,
      active_subscribers: (subscribers.data || []).filter((s: any) => s.status === "active").length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
