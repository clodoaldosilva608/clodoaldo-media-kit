import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/prospects
 * Lista prospects salvos no banco.
 * Query params: status?, niche?, city?, priority?, search?
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    const niche = url.searchParams.get("niche");
    const city = url.searchParams.get("city");
    const priority = url.searchParams.get("priority");
    const search = url.searchParams.get("search");
    const limit = Math.min(Number(url.searchParams.get("limit") || 500), 2000);

    let query = supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status && status !== "all") query = query.eq("status", status);
    if (niche && niche !== "all") query = query.eq("niche", niche);
    if (city && city !== "all") query = query.eq("city", city);
    if (priority && priority !== "all") query = query.eq("priority", priority);

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%,formatted_address.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist yet
      if (error.code === "PGRST205" || error.message.includes("schema") || error.message.includes("Does not exist")) {
        return NextResponse.json({ data: [], error: null });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/prospects
 * Salva um prospect (vindo da busca do Google Maps ou manual).
 * Body: prospect data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServer();

    // Se tem place_id, faz upsert (não duplica)
    if (body.place_id) {
      const { data: existing } = await supabase
        .from("prospects")
        .select("id, contacted_count")
        .eq("place_id", body.place_id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ data: existing, already_exists: true });
      }
    }

    const { data, error } = await supabase
      .from("prospects")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, saved: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/prospects
 * Atualiza um prospect (status, notes, priority, etc).
 * Body: { id, ...fields }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Se está marcando como contacted, incrementa contador e atualiza last_contact_at
    if (updates.status === "contacted" && !updates.last_contact_at) {
      updates.last_contact_at = new Date().toISOString();
      const { data: current } = await supabase
        .from("prospects")
        .select("contacted_count")
        .eq("id", id)
        .maybeSingle();
      updates.contacted_count = (current?.contacted_count || 0) + 1;
    }

    const { data, error } = await supabase
      .from("prospects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/prospects
 * Remove um prospect.
 * Body: { id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.from("prospects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
