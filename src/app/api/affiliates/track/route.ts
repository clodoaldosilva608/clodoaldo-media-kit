import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/affiliates/track
 * Registers an affiliate click.
 * Body: { slug, path, utm }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, path, utm } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Get affiliate
    const { data: aff } = await supabase
      .from("affiliates")
      .select("id, status, clicks")
      .eq("slug", slug)
      .maybeSingle();

    if (!aff) {
      // Slug doesn't exist or table missing — fail silently
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Insert click record (table may not exist yet)
    await supabase.from("affiliate_clicks").insert({
      affiliate_id: aff.id,
      slug,
      path: path || null,
      utm_source: utm?.source || null,
      utm_medium: utm?.medium || null,
      utm_campaign: utm?.campaign || null,
    }).then(() => {}, () => {});

    // Increment counter
    if (aff.status === "active") {
      await supabase
        .from("affiliates")
        .update({ clicks: (aff.clicks || 0) + 1 })
        .eq("slug", slug)
        .then(() => {}, () => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
