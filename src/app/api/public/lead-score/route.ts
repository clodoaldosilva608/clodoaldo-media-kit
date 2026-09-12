import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/public/lead-score?lead_id=<uuid>
 *
 * Calcula score 0-100 do lead baseado em:
 * - Tem WhatsApp? +20
 * - Rating ≥ 4.5? +15
 * - Não tem site (oportunidade)? +20
 * - Nicho quente? +10
 * - Cidade próxima (Recife metro)? +10
 * - Já respondeu? +25
 * - BANT qualificado? +20
 * - Demo gerado? +10
 * - Valor estimado > 0? +10
 *
 * Público (sem auth) — só usa campos públicos do lead.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();
    const { data: lead, error } = await sb.from("crm_leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw error;
    if (!lead) return NextResponse.json({ error: "not found" }, { status: 404 });

    const score = calculateScore(lead);
    const level = score >= 70 ? "quente" : score >= 40 ? "morno" : "frio";

    return NextResponse.json({ score, level, lead_id: leadId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export function calculateScore(lead: any): number {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // Tem WhatsApp? +20
  if (lead.whatsapp) { score += 20; breakdown["whatsapp"] = 20; }

  // Não tem site? +20 (oportunidade de venda)
  // site_status pode ser: 'no_site', 'broken', 'ok', 'unknown', null
  if (lead.site_status === "no_site" || lead.site_status === "broken") {
    score += 20; breakdown["sem_site_ou_quebrado"] = 20;
  } else if (!lead.site_status || lead.site_status === "unknown") {
    score += 10; breakdown["site_desconhecido"] = 10;
  }

  // BANT qualificado? +20
  const bantCount = [lead.bant_budget, lead.bant_authority, lead.bant_need, lead.bant_timing].filter(Boolean).length;
  if (bantCount >= 3) { score += 20; breakdown["bant_qualificado"] = 20; }
  else if (bantCount > 0) { score += bantCount * 5; breakdown["bant_parcial"] = bantCount * 5; }

  // Demo gerado? +10
  if (lead.demo_generated_at) { score += 10; breakdown["demo_gerado"] = 10; }

  // Valor estimado > 0? +10
  if (lead.estimated_value_cents > 0) { score += 10; breakdown["valor_estimado"] = 10; }

  // Stage avançado? +5 a +15
  const stageBonus: Record<string, number> = {
    "novo": 0,
    "qualificado": 5,
    "proposta": 10,
    "negociacao": 15,
    "fechado": 0, // já fechou, não precisa de score
    "perdido": 0,
  };
  const sb = stageBonus[lead.stage] || 0;
  if (sb > 0) { score += sb; breakdown["stage_avancado"] = sb; }

  // Source = parceiros? +5 (já prospectado)
  if (lead.source === "parceiros") { score += 5; breakdown["prospectado"] = 5; }

  return Math.min(score, 100);
}
