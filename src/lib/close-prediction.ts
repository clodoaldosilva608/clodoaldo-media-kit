import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * Predição de fechamento (Sprint C) — modelo determinístico e explicável,
 * baseado em leads históricos semelhantes (fechados vs perdidos).
 *
 * NÃO usa IA para o número: o cálculo é estatístico e auditável
 * (coorte ponderada por similaridade + suavização de Laplace + ajustes de
 * momentum e BANT). A IA Assistente apenas narra o resultado.
 *
 * Retorno:
 *   probability_pct — chance estimada de fechamento (3–97%)
 *   confidence      — alta | media | baixa (tamanho da coorte)
 *   factors         — lista explicando o que puxou o número pra cima/baixo
 */

export interface PredictionResult {
  probability_pct: number;
  confidence: "alta" | "media" | "baixa";
  cohort_size: number;
  base_rate_pct: number;
  factors: Array<{ texto: string; impacto: "positivo" | "negativo" | "neutro" }>;
}

// Pesos de similaridade por atributo
const W = { source: 3, budget_range: 2, proposed_service_slug: 2, bant_signature: 3, site_status: 1 };

function bantSignature(l: Record<string, any>): string {
  return [l.bant_budget, l.bant_authority, l.bant_need, l.bant_timing].map(Boolean).join("|");
}

export async function predictClose(leadId: string): Promise<PredictionResult | { error: string }> {
  const sb = getSupabaseServer();

  const { data: leadData, error: leadErr } = await sb.from("crm_leads").select("*").eq("id", leadId).maybeSingle();
  if (leadErr) return { error: leadErr.message };
  if (!leadData) return { error: "Lead não encontrado" };
  const lead = leadData as Record<string, any>;

  // Coorte histórica: apenas desfechos conhecidos
  const { data: history, error: histErr } = await sb
    .from("crm_leads")
    .select("id, stage, source, budget_range, proposed_service_slug, bant_budget, bant_authority, bant_need, bant_timing, site_status, estimated_value_cents, created_at, updated_at")
    .in("stage", ["fechado", "perdido"])
    .neq("id", leadId);
  if (histErr) return { error: histErr.message };

  const rows: Record<string, any>[] = history || [];
  const baseRate = rows.length ? rows.filter((r) => r.stage === "fechado").length / rows.length : 0.15;

  // Taxa base de fallback quando não há histórico nenhum
  if (rows.length === 0) {
    return {
      probability_pct: 15,
      confidence: "baixa",
      cohort_size: 0,
      base_rate_pct: 15,
      factors: [
        { texto: "Ainda não há leads fechados ou perdidos suficientes para aprender com o histórico", impacto: "neutro" },
        { texto: "Estimativa usa a taxa base inicial de 15% — será refinada conforme o funil amadurece", impacto: "neutro" },
      ],
    };
  }

  // Similaridade ponderada da coorte
  const leadBant = bantSignature(lead);
  let wFechado = 0;
  let wTotal = 0;
  let matchesSource = 0;
  let matchesBant = 0;
  const factors: PredictionResult["factors"] = [];

  for (const h of rows) {
    let w = 0;
    if (lead.source && h.source === lead.source) {
      w += W.source;
      matchesSource++;
    }
    if (lead.budget_range && h.budget_range === lead.budget_range) w += W.budget_range;
    if (lead.proposed_service_slug && h.proposed_service_slug === lead.proposed_service_slug) {
      w += W.proposed_service_slug;
    }
    if (leadBant === bantSignature(h)) {
      w += W.bant_signature;
      matchesBant++;
    }
    if (lead.site_status && h.site_status === lead.site_status) w += W.site_status;

    if (w >= 2) {
      wTotal += w;
      if (h.stage === "fechado") wFechado += w;
    }
  }

  // Suavização de Laplace com prior = taxa global (evita extremos com coorte pequena)
  const K = 5;
  let p = (wFechado + K * baseRate) / (wTotal + K);

  // Momentum: leads sem interação esfriam
  const diasParado = Math.floor((Date.now() - new Date(lead.updated_at).getTime()) / 86_400_000);
  let momentumAdj = 0;
  if (diasParado <= 2) momentumAdj = 0.05;
  else if (diasParado <= 7) momentumAdj = 0;
  else if (diasParado <= 14) momentumAdj = -0.1;
  else momentumAdj = -0.2;
  p += momentumAdj;

  // BANT completo aumenta probabilidade
  const bantScore = [lead.bant_budget, lead.bant_authority, lead.bant_need, lead.bant_timing].filter(Boolean).length;
  const bantAdj = bantScore === 4 ? 0.08 : bantScore === 3 ? 0.04 : 0;
  p += bantAdj;

  const probability = Math.round(Math.min(Math.max(p, 0.03), 0.97) * 100);
  const confidence = wTotal >= 12 ? "alta" : wTotal >= 5 ? "media" : "baixa";

  // Fatores explicáveis
  if (wTotal > 0) {
    factors.push({
      texto: `Coorte: ${rows.filter((r) => r.stage === "fechado").length} fechados e ${rows.filter((r) => r.stage === "perdido").length} perdidos no histórico; semelhança ponderada equivalente a ${(wTotal / 6).toFixed(1)} leads`,
      impacto: "neutro",
    });
  }
  if (matchesSource > 0) {
    const srcFech = rows.filter((r) => r.source === lead.source && r.stage === "fechado").length;
    const srcTotal = rows.filter((r) => r.source === lead.source).length;
    factors.push({
      texto: `Mesma origem "${lead.source}" aparece no histórico (${srcFech}/${srcTotal} fecharam)`,
      impacto: srcTotal > 0 && srcFech / srcTotal >= baseRate ? "positivo" : "negativo",
    });
  }
  if (matchesBant > 0) {
    factors.push({ texto: `Assinatura BANT igual à de ${matchesBant} lead(s) histórico(s)`, impacto: "positivo" });
  }
  if (bantScore === 4) factors.push({ texto: "BANT 4/4 completo — qualificação máxima", impacto: "positivo" });
  else if (bantScore === 0) factors.push({ texto: "BANT não preenchido — preencha para refinar a predição", impacto: "negativo" });
  if (momentumAdj > 0) factors.push({ texto: `Interação recente (${diasParado}d) — lead aquecido`, impacto: "positivo" });
  if (momentumAdj < 0) factors.push({ texto: `${diasParado} dias sem interação — momentum esfriando`, impacto: "negativo" });
  if (lead.estimated_value_cents) factors.push({ texto: `Valor estimado R$ ${(lead.estimated_value_cents / 100).toLocaleString("pt-BR")}`, impacto: "neutro" });

  return {
    probability_pct: probability,
    confidence,
    cohort_size: rows.length,
    base_rate_pct: Math.round(baseRate * 100),
    factors: factors.slice(0, 5),
  };
}
