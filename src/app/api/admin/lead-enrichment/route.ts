import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/lead-enrichment?lead_id=UUID
 *
 * Busca dados enriquecidos do prospect correspondente ao lead.
 * O lead em crm_leads tem prospect_id (FK pra clodoaldo_prospects no meucorre).
 *
 * Response: {
 *   prospect_id: string,
 *   owner_name: string | null,
 *   owner_email: string | null,
 *   instagram_handle: string | null,
 *   enriched_at: string | null,
 *   enrichment_data: any,
 *   website: string | null
 * }
 *
 * POST /api/admin/lead-enrichment?lead_id=UUID
 *   Força enriquecimento imediato (chama o enrichLead internamente).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();
    const { data: lead, error } = await sb.from("crm_leads")
      .select("id, prospect_id, name, intent")
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw error;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    if (!lead.prospect_id) {
      return NextResponse.json({
        success: true,
        enriched: false,
        reason: "Lead não tem prospect_id vinculado (provavelmente veio de fonte externa)",
      });
    }

    const pool = getMeucorrePool();
    const { rows } = await pool.query(
      `SELECT id, name, niche, city, website, owner_name, owner_email,
              instagram_handle, enriched_at, enrichment_data
       FROM clodoaldo_prospects
       WHERE id = $1`,
      [lead.prospect_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        enriched: false,
        reason: "Prospect não encontrado no meucorre",
      });
    }

    const p = rows[0];
    return NextResponse.json({
      success: true,
      enriched: !!p.enriched_at,
      prospect_id: p.id,
      owner_name: p.owner_name,
      owner_email: p.owner_email,
      instagram_handle: p.instagram_handle,
      enriched_at: p.enriched_at,
      enrichment_data: p.enrichment_data,
      website: p.website,
      niche: p.niche,
      city: p.city,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    // Chamar o cron de enriquecimento passando só esse lead
    // (usar a mesma lógica do enrichLead internamente)
    const cronUrl = new URL("/api/cron/enrich-leads", req.url);
    const cronResp = await fetch(cronUrl.toString(), {
      method: "POST",
      headers: {
        "authorization": `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!cronResp.ok) {
      return NextResponse.json({ error: `Cron failed: ${cronResp.status}` }, { status: 502 });
    }

    const result = await cronResp.json();
    return NextResponse.json({
      success: true,
      message: "Enriquecimento executado (processa até 10 leads pendentes)",
      ...result,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
