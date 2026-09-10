import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { cached, invalidateCachePrefix } from "@/lib/cache";

/**
 * GET /api/admin/stats
 * Returns aggregate stats for the admin overview.
 * Requires service_role (server-side only, never exposed).
 *
 * Cached for 30 seconds — stats don't change second-by-second and this
 * avoids hammering Supabase with full-table scans on every page load.
 */
export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get("period") as "today" | "week" | "month" | "all") || "week";
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";

    if (refresh) {
      invalidateCachePrefix("admin:stats:");
    }

    const data = await cached(
      `admin:stats:${period}`,
      30_000, // 30 seconds
      async () => {
        const supabase = getSupabaseServer();
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

        // === Bulk-send stats from meucorre DB (clodoaldo_envios + clodoaldo_prospects) ===
        let enviosToday = 0;
        let enviosTotal = 0;
        let prospectsContacted = 0;
        let prospectsTotal = 0;
        try {
          const client = await getMeucorrePool().connect();
          try {
            // Today's sends (start of today in Brazil timezone)
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            const enviosTodayRes = await client.query(
              "SELECT count(*)::int as c FROM public.clodoaldo_envios WHERE sent_at >= $1",
              [todayStart.toISOString()]
            );
            enviosToday = enviosTodayRes.rows[0]?.c || 0;

            const enviosTotalRes = await client.query(
              "SELECT count(*)::int as c FROM public.clodoaldo_envios"
            );
            enviosTotal = enviosTotalRes.rows[0]?.c || 0;

            const prospectsContactedRes = await client.query(
              "SELECT count(*)::int as c FROM public.clodoaldo_prospects WHERE status = 'contacted'"
            );
            prospectsContacted = prospectsContactedRes.rows[0]?.c || 0;

            const prospectsTotalRes = await client.query(
              "SELECT count(*)::int as c FROM public.clodoaldo_prospects"
            );
            prospectsTotal = prospectsTotalRes.rows[0]?.c || 0;
          } finally {
            client.release();
          }
        } catch (e) {
          // meucorre DB may be unavailable — return zeros
        }

        return {
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
          // Bulk-send / prospecting stats
          envios_today: enviosToday,
          envios_total: enviosTotal,
          prospects_total: prospectsTotal,
          prospects_contacted: prospectsContacted,
        };
      },
    );

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
