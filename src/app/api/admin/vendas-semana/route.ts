import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/vendas-semana?days=7
 *
 * Dashboard do método Gabriel Miranda — métricas da semana:
 *   - demos_gerados: leads com demo_generated_at nos últimos N dias
 *   - bant_qualificados: leads com bant_score >= 3 (qualificados)
 *   - propostas_enviadas: leads no stage "proposta"
 *   - vendas_fechadas: leads no stage "fechado"
 *   - receita_projetada: pipeline (proposta + negociacao) × R$1.700 ticket médio
 *   - receita_realizada: fechados × R$1.700
 *   - conversao_demo_proposta: demos / propostas
 *   - conversao_proposta_venda: propostas / fechados
 *   - por_status_site: distribution { ok, broken, no_site, slow, ssl_invalid, unknown }
 *   - por_origem: distribution por source
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") || 7), 1), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const sb: any = getSupabaseServer();

    // Buscar leads
    const { data: leads, error } = await sb.from("crm_leads")
      .select("id, name, source, stage, estimated_value_cents, demo_url, demo_generated_at, site_status, bant_budget, bant_authority, bant_need, bant_timing, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;

    const allLeads = leads || [];

    // Métricas
    const demosGerados = allLeads.filter((l: any) => l.demo_generated_at && new Date(l.demo_generated_at) >= new Date(since));
    const bantQualificados = allLeads.filter((l: any) =>
      [l.bant_budget, l.bant_authority, l.bant_need, l.bant_timing].filter(Boolean).length >= 3
    );
    const propostasEnviadas = allLeads.filter((l: any) => l.stage === "proposta" || l.stage === "negociacao");
    const vendasFechadas = allLeads.filter((l: any) => l.stage === "fechado");
    const perdidos = allLeads.filter((l: any) => l.stage === "perdido");

    const TICKET_MEDIO = 170000; // R$1.700 em cents (média do método Gabriel Miranda: R$1.400-2.000)

    const receitaProjetada = propostasEnviadas.reduce((s: number, l: any) => s + (l.estimated_value_cents || TICKET_MEDIO), 0);
    const receitaRealizada = vendasFechadas.reduce((s: number, l: any) => s + (l.estimated_value_cents || TICKET_MEDIO), 0);

    // Distribution by site_status
    const porStatusSite: Record<string, number> = {};
    allLeads.forEach((l: any) => {
      const s = l.site_status || "unknown";
      porStatusSite[s] = (porStatusSite[s] || 0) + 1;
    });

    // Distribution by source
    const porOrigem: Record<string, number> = {};
    allLeads.forEach((l: any) => {
      const s = l.source || "desconhecido";
      porOrigem[s] = (porOrigem[s] || 0) + 1;
    });

    // Conversion rates
    const conversaoDemoProposta = demosGerados.length > 0
      ? Math.round((propostasEnviadas.length / demosGerados.length) * 100)
      : 0;
    const conversaoPropostaVenda = propostasEnviadas.length > 0
      ? Math.round((vendasFechadas.length / propostasEnviadas.length) * 100)
      : 0;

    // Recent demos (for list display)
    const recentDemos = demosGerados.slice(0, 10).map((l: any) => ({
      id: l.id,
      name: l.name,
      demo_url: l.demo_url,
      demo_generated_at: l.demo_generated_at,
      stage: l.stage,
    }));

    // Recent BANT qualified
    const recentBant = bantQualificados.slice(0, 10).map((l: any) => ({
      id: l.id,
      name: l.name,
      stage: l.stage,
      bant_score: [l.bant_budget, l.bant_authority, l.bant_need, l.bant_timing].filter(Boolean).length,
    }));

    return NextResponse.json({
      period: {
        days,
        start: since,
        end: new Date().toISOString(),
      },
      metrics: {
        total_leads: allLeads.length,
        demos_gerados: demosGerados.length,
        bant_qualificados: bantQualificados.length,
        propostas_enviadas: propostasEnviadas.length,
        vendas_fechadas: vendasFechadas.length,
        perdidos: perdidos.length,
        receita_projetada_cents: receitaProjetada,
        receita_realizada_cents: receitaRealizada,
        conversao_demo_proposta_pct: conversaoDemoProposta,
        conversao_proposta_venda_pct: conversaoPropostaVenda,
        ticket_medio_cents: TICKET_MEDIO,
      },
      distributions: {
        por_status_site: porStatusSite,
        por_origem: porOrigem,
      },
      recent_demos: recentDemos,
      recent_bant: recentBant,
      generated_at: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
