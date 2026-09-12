import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const STAGES = ["novo", "qualificado", "proposta", "negociacao", "fechado", "perdido"] as const;
const INTENTS = ["marca", "creator", "empresa", "suporte"] as const;
const SOURCES = ["quiz", "contact_form", "whatsapp", "manual", "proposta_calculadora"] as const;

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  project_idea: z.string().max(2000).optional().nullable(),
  intent: z.enum(INTENTS).optional(),
  budget_range: z.string().max(50).optional().nullable(),
  deadline: z.string().max(50).optional().nullable(),
  source: z.enum(SOURCES).default("manual"),
  stage: z.enum(STAGES).default("novo"),
  estimated_value_cents: z.number().int().nonnegative().optional(),
  proposed_service_slug: z.string().max(120).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(STAGES).optional(),
  notes: z.string().max(5000).optional().nullable(),
  estimated_value_cents: z.number().int().nonnegative().optional(),
  proposed_service_slug: z.string().max(120).optional().nullable(),
  budget_range: z.string().max(50).optional().nullable(),
  deadline: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(254).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  // BANT (método Gabriel Miranda)
  bant_budget: z.boolean().optional(),
  bant_authority: z.boolean().optional(),
  bant_need: z.boolean().optional(),
  bant_timing: z.boolean().optional(),
  bant_notes: z.string().max(2000).optional().nullable(),
  // Site status
  site_status: z.string().max(30).optional().nullable(),
  site_checked_at: z.string().optional().nullable(),
  // Demo
  demo_url: z.string().max(500).optional().nullable(),
  demo_generated_at: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase: any = getSupabaseServer();
    const url = req.nextUrl;
    const stage = url.searchParams.get("stage");
    const source = url.searchParams.get("source");
    const search = url.searchParams.get("search");
    const limit = Math.min(Number(url.searchParams.get("limit") || 500), 2000);

    let query = supabase.from("crm_leads").select("*").order("created_at", { ascending: false }).limit(limit);
    if (stage && stage !== "all") query = query.eq("stage", stage);
    if (source && source !== "all") query = query.eq("source", source);
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,project_idea.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      // Table may not exist yet — graceful degradation
      if (error.message.includes("relation") || error.message.includes("Does not exist") || error.code === "PGRST205") {
        return NextResponse.json({ data: [], stats: {} });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: allLeads } = await supabase.from("crm_leads").select("stage, estimated_value_cents");
    const stats: Record<string, { count: number; total_value_cents: number }> = {};
    STAGES.forEach((s) => {
      const items = (allLeads || []).filter((l: any) => l.stage === s);
      stats[s] = {
        count: items.length,
        total_value_cents: items.reduce((sum: number, l: any) => sum + (l.estimated_value_cents || 0), 0),
      };
    });

    return NextResponse.json({ data: data || [], stats });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.flatten() }, { status: 400 });
    const supabase: any = getSupabaseServer();
    const { data, error } = await supabase.from("crm_leads").insert(parsed.data).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("crm_lead_events").insert({ lead_id: data.id, event_type: "stage_change", to_stage: data.stage, description: `Lead criado no estágio "${data.stage}"` });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.flatten() }, { status: 400 });
    const supabase: any = getSupabaseServer();
    const { id, ...updates } = parsed.data;
    const { data: current } = await supabase.from("crm_leads").select("stage").eq("id", id).maybeSingle();
    const { data, error } = await supabase.from("crm_leads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (updates.stage && current?.stage !== updates.stage) {
      await supabase.from("crm_lead_events").insert({ lead_id: id, event_type: "stage_change", from_stage: current?.stage, to_stage: updates.stage, description: `Estágio alterado de "${current?.stage || "—"}" para "${updates.stage}"` });
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const supabase: any = getSupabaseServer();
    const { error } = await supabase.from("crm_leads").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
