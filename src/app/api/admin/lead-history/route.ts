import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET  /api/admin/lead-history?lead_id=...
 *   Lê de crm_lead_events (tabela existente) — sem precisar criar nova tabela.
 *
 * POST /api/admin/lead-history  { lead_id, event_type, notes, from_stage, to_stage, actor, metadata }
 *   Cria entrada em crm_lead_events (event_type genérico).
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { data, error } = await sb
      .from("crm_lead_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      // Tabela não existe ainda — retorna vazio em vez de erro
      if (error.message.includes("relation") || error.code === "PGRST205") {
        return NextResponse.json({ history: [] });
      }
      throw error;
    }
    return NextResponse.json({ history: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, event_type, notes, from_stage, to_stage, actor, metadata } = body;
    if (!lead_id || !event_type) return NextResponse.json({ error: "lead_id and event_type required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const insert: any = {
      lead_id,
      event_type,
      description: notes || "",
    };
    if (from_stage) insert.from_stage = from_stage;
    if (to_stage) insert.to_stage = to_stage;

    const { data, error } = await sb.from("crm_lead_events").insert(insert).select().single();
    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
