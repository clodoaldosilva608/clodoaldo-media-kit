import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { RECOVERY_VARIANTS } from "@/lib/recovery-variants";

/**
 * GET /api/admin/recovery
 * Returns abandoned carts with recovery info + A/B test stats.
 *
 * Query params:
 *  - status: "pending" | "sent" | "recovered" | "all" (default: all)
 *  - variant: "A" | "B" | "C" (filter by variant)
 *  - limit: max 200 (default 100)
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const status = req.nextUrl.searchParams.get("status") || "all";
    const variantFilter = req.nextUrl.searchParams.get("variant");
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 100), 200);

    // Build query
    let query = supabase
      .from("abandoned_carts")
      .select(
        "id, session_id, service_slug, customer_name, customer_email, customer_phone, total_cents, created_at, updated_at, recovery_email_sent, recovery_variant, recovery_link, recovery_attempted_at, recovered, recovered_order_id",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status === "pending") {
      query = query.eq("recovery_email_sent", false).eq("recovered", false);
    } else if (status === "sent") {
      query = query.eq("recovery_email_sent", true).eq("recovered", false);
    } else if (status === "recovered") {
      query = query.eq("recovered", true);
    }

    if (variantFilter && ["A", "B", "C"].includes(variantFilter)) {
      query = query.eq("recovery_variant", variantFilter);
    }

    const { data: carts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // A/B test stats: count by variant × recovered
    const { data: stats, error: statsErr } = await supabase
      .from("abandoned_carts")
      .select("recovery_variant, recovered, recovery_email_sent");

    const abStats = RECOVERY_VARIANTS.map((v) => {
      const sent = (stats || []).filter(
        (s: any) => s.recovery_variant === v.id && s.recovery_email_sent,
      ).length;
      const recovered = (stats || []).filter(
        (s: any) =>
          s.recovery_variant === v.id && s.recovery_email_sent && s.recovered,
      ).length;
      const conversionRate = sent > 0 ? (recovered / sent) * 100 : 0;
      return {
        variant: v.id,
        name: v.name,
        description: v.description,
        sent,
        recovered,
        conversion_rate: Number(conversionRate.toFixed(2)),
      };
    });

    // Summary KPIs
    const totalCarts = carts?.length || 0;
    const pendingRecovery = (carts || []).filter((c: any) => !c.recovery_email_sent).length;
    const sentNotRecovered = (carts || []).filter(
      (c: any) => c.recovery_email_sent && !c.recovered,
    ).length;
    const recovered = (carts || []).filter((c: any) => c.recovered).length;
    const potentialRevenue = (carts || [])
      .filter((c: any) => !c.recovered)
      .reduce((s: number, c: any) => s + (c.total_cents || 0), 0);
    const recoveredRevenue = (carts || [])
      .filter((c: any) => c.recovered)
      .reduce((s: number, c: any) => s + (c.total_cents || 0), 0);

    return NextResponse.json({
      carts: carts || [],
      stats: {
        ab_variants: abStats,
        summary: {
          total: totalCarts,
          pending: pendingRecovery,
          sent_not_recovered: sentNotRecovered,
          recovered,
          potential_revenue_cents: potentialRevenue,
          recovered_revenue_cents: recoveredRevenue,
          recovery_rate:
            totalCarts > 0
              ? Number(((recovered / totalCarts) * 100).toFixed(2))
              : 0,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/recovery
 * Manually mark a cart as recovered (admin override) or trigger re-send.
 *
 * Body: { id, action: "mark_recovered" | "resend" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    if (action === "mark_recovered") {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .update({ recovered: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, cart: data });
    }

    if (action === "resend") {
      // Reset the cart so the next cron run picks it up again
      const { data, error } = await supabase
        .from("abandoned_carts")
        .update({
          recovery_email_sent: false,
          recovery_attempted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, cart: data });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
