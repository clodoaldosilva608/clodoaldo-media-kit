import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";


export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const limit = Math.min(Number(url.searchParams.get("limit") || 500), 2000);
    const client = await getMeucorrePool().connect();
    try {
      let query = "SELECT * FROM public.clodoaldo_prospects";
      const conditions: string[] = [];
      const params: any[] = [];
      let idx = 1;
      if (status && status !== "all") { conditions.push(`status = $${idx++}`); params.push(status); }
      if (search) { conditions.push(`(name ILIKE $${idx} OR phone ILIKE $${idx} OR city ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
      if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
      query += ` ORDER BY created_at DESC LIMIT $${idx++}`;
      params.push(limit);
      const result = await client.query(query, params);
      return NextResponse.json({ data: result.rows, error: null });
    } finally { client.release(); }
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await getMeucorrePool().connect();
    try {
      if (body.place_id) {
        const existing = await client.query("SELECT id FROM public.clodoaldo_prospects WHERE place_id = $1", [body.place_id]);
        if (existing.rows.length > 0) return NextResponse.json({ data: existing.rows[0], already_exists: true });
      }
      const cols = ["place_id","name","category","formatted_address","city","phone","website","email","whatsapp","instagram","facebook","lat","lng","rating","user_ratings_total","status","priority","source","niche","search_location","has_website","has_whatsapp","has_email","has_social_media","web_dev_opportunity","opening_hours"];
      const values: any[] = []; const placeholders: string[] = []; let idx = 1;
      for (const col of cols) { if (body[col] !== undefined) { values.push(body[col]); placeholders.push(`$${idx++}`); } }
      const colNames = cols.filter(c => body[c] !== undefined);
      const result = await client.query(`INSERT INTO public.clodoaldo_prospects (${colNames.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`, values);
      return NextResponse.json({ data: result.rows[0], saved: true });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const client = await getMeucorrePool().connect();
    try {
      if (updates.status === "contacted" && !updates.last_contact_at) {
        updates.last_contact_at = new Date().toISOString();
        const cur = await client.query("SELECT contacted_count FROM public.clodoaldo_prospects WHERE id = $1", [id]);
        updates.contacted_count = (cur.rows[0]?.contacted_count || 0) + 1;
      }
      const cols = Object.keys(updates); const sets = cols.map((c,i) => `${c} = $${i+1}`).join(", ");
      const values = cols.map(c => updates[c]); values.push(id);
      const result = await client.query(`UPDATE public.clodoaldo_prospects SET ${sets}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
      return NextResponse.json({ data: result.rows[0] });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const client = await getMeucorrePool().connect();
    try { await client.query("DELETE FROM public.clodoaldo_prospects WHERE id = $1", [id]); return NextResponse.json({ ok: true }); }
    finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
