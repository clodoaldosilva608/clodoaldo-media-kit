import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/data?type=orders|queue|leads|briefings|offers|testimonials|coupons|...
 *
 * Unified admin data endpoint. Uses service_role key to bypass RLS.
 * Returns empty arrays for tables that don't exist (graceful degradation).
 */
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "";
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 500), 2000);
    const supabase = getSupabaseServer();

    const fetchTable = async (table: string, orderCol = "created_at", ascending = false) => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderCol, { ascending })
        .limit(limit);
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("schema") || error.message.includes("Does not exist")) {
          return [];
        }
        console.error(`[admin/data] ${table} error:`, error.message);
        return [];
      }
      return data || [];
    };

    let data: any[] = [];

    switch (type) {
      case "orders":
        data = await fetchTable("orders", "created_at", false);
        break;
      case "queue":
        data = await fetchTable("service_queue", "created_at", false);
        break;
      case "leads":
        data = await fetchTable("quiz_leads", "created_at", false);
        break;
      case "briefings":
        data = await fetchTable("service_requests", "created_at", false);
        break;
      case "offers":
        data = await fetchTable("offers", "order_index", true);
        break;
      case "analytics_events":
        data = await fetchTable("analytics_events", "created_at", false);
        break;
      case "coupons":
        data = await fetchTable("coupons", "created_at", false);
        break;
      case "testimonials":
        data = await fetchTable("testimonials", "position", true);
        break;
      case "countdown":
        data = await fetchTable("countdown_campaigns", "ends_at", false);
        break;
      case "pixels":
        data = await fetchTable("pixel_config", "created_at", false);
        break;
      case "whatsapp":
        data = await fetchTable("whatsapp_config", "created_at", false);
        break;
      case "affiliates":
        data = await fetchTable("affiliates", "created_at", false);
        break;
      case "affiliate_sales":
        data = await fetchTable("affiliate_sales", "created_at", false);
        break;
      case "email_templates":
        data = await fetchTable("email_templates", "created_at", false);
        break;
      case "email_subscribers":
        data = await fetchTable("email_subscribers", "subscribed_at", false);
        break;
      case "subscription_plans":
        data = await fetchTable("subscription_plans", "price_cents", true);
        break;
      case "subscriptions":
        data = await fetchTable("subscriptions", "created_at", false);
        break;
      case "notifications":
        data = await fetchTable("notifications", "created_at", false);
        break;
      case "app_settings":
        data = await fetchTable("app_settings", "key", true);
        break;
      case "abandoned_carts":
        data = await fetchTable("abandoned_carts", "created_at", false);
        break;
      case "user_roles":
        data = await fetchTable("user_roles", "created_at", false);
        break;
      case "knowledge_items":
        data = await fetchTable("knowledge_items", "created_at", false);
        break;
      case "supporters":
        data = await fetchTable("supporters", "created_at", false);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ data, type });
  } catch (e: any) {
    console.error("[admin/data] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/data
 * Body: { table, action: "insert"|"update"|"delete"|"upsert", id?, payload? }
 *
 * Generic CRUD for admin tables. Uses service_role key.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, action, id, payload } = body;

    if (!table || !action) {
      return NextResponse.json({ error: "Missing table or action" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    let result;
    switch (action) {
      case "insert":
        result = await supabase.from(table).insert(payload).select().single();
        break;
      case "update":
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        result = await supabase.from(table).update(payload).eq("id", id);
        break;
      case "delete":
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        result = await supabase.from(table).delete().eq("id", id);
        break;
      case "upsert":
        result = await supabase.from(table).upsert(payload).select();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.error) {
      if (result.error.code === "PGRST205") {
        return NextResponse.json({ ok: true, ignored: true });
      }
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
