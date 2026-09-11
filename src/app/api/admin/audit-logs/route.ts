import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * GET  /api/admin/audit-logs?actor=&action=&entity=&entity_id=&from=&to=&limit=
 * POST /api/admin/audit-logs  { actor, actor_role, action, entity, entity_id, details }
 */
function getServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const p = url.searchParams;
    const limit = Math.min(Number(p.get("limit") || 200), 1000);

    const sb = getServer();
    let q = sb.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit) as any;
    if (p.get("actor")) q = q.eq("actor", p.get("actor")!);
    if (p.get("action")) q = q.eq("action", p.get("action")!);
    if (p.get("entity")) q = q.eq("entity", p.get("entity")!);
    if (p.get("entity_id")) q = q.eq("entity_id", p.get("entity_id")!);
    if (p.get("from")) q = q.gte("created_at", p.get("from")!);
    if (p.get("to")) q = q.lte("created_at", p.get("to")!);

    const { data, error } = await q;
    if (error) throw error;

    const [actors, actions, entities] = await Promise.all([
      sb.from("audit_logs").select("actor").order("actor"),
      sb.from("audit_logs").select("action").order("action"),
      sb.from("audit_logs").select("entity").order("entity"),
    ]);

    const uniq = (arr: any[]) => Array.from(new Set((arr || []).map((r: any) => r.actor || r.action || r.entity).filter(Boolean)));

    return NextResponse.json({
      logs: data || [],
      total: (data || []).length,
      filters: {
        actors: uniq(actors.data || []),
        actions: uniq(actions.data || []),
        entities: uniq(entities.data || []),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actor, actor_role, action, entity, entity_id, details, ip, user_agent } = body;
    if (!actor || !action) return NextResponse.json({ error: "actor and action required" }, { status: 400 });
    const sb = getServer();
    const { data, error } = await sb.from("audit_logs").insert({
      actor, actor_role: actor_role || null, action,
      entity: entity || null, entity_id: entity_id || null,
      details: details || {}, ip: ip || null, user_agent: user_agent || null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ log: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
