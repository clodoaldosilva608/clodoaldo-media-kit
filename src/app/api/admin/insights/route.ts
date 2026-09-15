import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/insights — Insights semanais (Sprint C)
 *
 * Inteligência determinística comparando a última semana (7d) com a anterior (7–14d):
 *   - por nicho       (clodoaldo_prospects.niche)
 *   - por cidade      (clodoaldo_prospects.city)
 *   - por horário     (hora de envio, TZ America/Sao_Paulo)
 *   - por variante    (clodoaldo_envios.message_variant)
 *   - resumo WoW      (envios, respostas, reply rate, leads novos, avançados, fechados)
 *   - insights        (strings prontas, geradas por regras — sem custo de IA)
 *
 * Somente leitura (Nível 1). Se as tabelas de envio não existirem, degrada
 * com dados vazios em vez de falhar.
 */

const BRT = "America/Sao_Paulo";

function weekWindow(offsetWeeks: number) {
  // Semana corrente = últimos 7 dias (rolando). offsetWeeks=1 → semana anterior.
  const end = new Date(Date.now() - offsetWeeks * 7 * 86_400_000);
  const start = new Date(end.getTime() - 7 * 86_400_000);
  return { start: start.toISOString(), end: end.toISOString() };
}

interface Bucket {
  nome: string;
  envios: number;
  respostas: number;
}

function addTo(map: Map<string, Bucket>, nome: string, key: "envios" | "respostas") {
  if (!nome) return;
  const b = map.get(nome) || { nome, envios: 0, respostas: 0 };
  b[key] += 1;
  map.set(nome, b);
}

function ratePct(b: Bucket): number {
  return b.envios > 0 ? Math.round((b.respostas / b.envios) * 100) : 0;
}

function topBuckets(map: Map<string, Bucket>, minEnvios = 3, limit = 6): Bucket[] {
  return [...map.values()]
    .filter((b) => b.envios >= minEnvios)
    .sort((a, b) => ratePct(b) - ratePct(a) || b.envios - a.envios)
    .slice(0, limit);
}

export async function GET() {
  try {
    const atual = weekWindow(0);
    const anterior = weekWindow(1);

    // ── Meucorre DB: envios + respostas por nicho/cidade/horário/variante ──
    let porNicho = new Map<string, Bucket>();
    let porCidade = new Map<string, Bucket>();
    let porHorario = new Map<string, Bucket>();
    let porVariante = new Map<string, Bucket>();
    let prevEnvios = 0;
    let prevRespostas = 0;
    let dbOk = true;

    try {
      const client = await getMeucorrePool().connect();
      try {
        // Semana atual — envios com breakdown
        const envRes = await client.query(
          `SELECT e.message_variant,
                  EXTRACT(HOUR FROM e.sent_at AT TIME ZONE $3)::int AS hora,
                  p.niche, p.city
             FROM public.clodoaldo_envios e
             LEFT JOIN public.clodoaldo_prospects p ON p.id::text = e.prospect_id::text
            WHERE e.sent_at >= $1 AND e.sent_at < $2`,
          [atual.start, atual.end, BRT]
        );
        for (const r of envRes.rows) {
          addTo(porNicho, r.niche, "envios");
          addTo(porCidade, r.city, "envios");
          addTo(porHorario, String(r.hora ?? 0).padStart(2, "0") + "h", "envios");
          addTo(porVariante, r.message_variant || "sem-variante", "envios");
        }

        // Semana atual — respostas
        const resRes = await client.query(
          `SELECT p.niche, p.city
             FROM public.clodoaldo_respostas r
             LEFT JOIN public.clodoaldo_prospects p ON p.id::text = r.prospect_id::text
            WHERE r.received_at >= $1 AND r.received_at < $2`,
          [atual.start, atual.end]
        );
        for (const r of resRes.rows) {
          addTo(porNicho, r.niche, "respostas");
          addTo(porCidade, r.city, "respostas");
        }

        // Semana anterior — totais para deltas
        const prevEnv = await client.query(
          `SELECT count(*)::int AS total FROM public.clodoaldo_envios WHERE sent_at >= $1 AND sent_at < $2`,
          [anterior.start, anterior.end]
        );
        prevEnvios = prevEnv.rows[0]?.total || 0;
        const prevRes = await client.query(
          `SELECT count(*)::int AS total FROM public.clodoaldo_respostas WHERE received_at >= $1 AND received_at < $2`,
          [anterior.start, anterior.end]
        );
        prevRespostas = prevRes.rows[0]?.total || 0;
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      console.warn("[insights] meucorre DB indisponível:", dbErr.message);
      dbOk = false;
    }

    const curEnvios = [...porNicho.values()].reduce((s, b) => s + b.envios, 0);
    const curRespostas = [...porNicho.values()].reduce((s, b) => s + b.respostas, 0);

    // ── Supabase: leads novos / avançados / fechados nas duas janelas ──
    const sb = getSupabaseServer();
    const { data: leadsRows } = await sb
      .from("crm_leads")
      .select("id, stage, estimated_value_cents, prospect_id, created_at, updated_at")
      .gte("created_at", anterior.start)
      .or(`updated_at.gte.${anterior.start},stage.eq.fechado`);

    const rows: any[] = leadsRows || [];
    const inWindow = (iso: string, w: { start: string; end: string }) =>
      iso >= w.start && iso < w.end;

    const leadsAtual = rows.filter((r) => inWindow(r.created_at, atual));
    const leadsAnterior = rows.filter((r) => inWindow(r.created_at, anterior));
    const avancadosAtual = leadsAtual.filter((r) => r.stage !== "novo").length;
    const fechadosRows = rows.filter((r) => r.stage === "fechado" && inWindow(r.updated_at, atual));
    const fechadosAnterior = rows.filter(
      (r) => r.stage === "fechado" && inWindow(r.updated_at, anterior)
    ).length;

    // Nicho dos leads novos via prospect_id → meucorre (quando disponível)
    const prospectIds = [...new Set(leadsAtual.map((r) => r.prospect_id).filter(Boolean))] as string[];
    const leadNichoMap = new Map<string, Bucket>();
    if (dbOk && prospectIds.length > 0) {
      try {
        const client = await getMeucorrePool().connect();
        try {
          const pn = await client.query(
            `SELECT id::text AS id, niche FROM public.clodoaldo_prospects WHERE id::text = ANY($1)`,
            [prospectIds]
          );
          const nicheById = new Map(pn.rows.map((r: any) => [r.id, r.niche]));
          for (const r of leadsAtual) {
            const niche = nicheById.get(r.prospect_id);
            if (niche) addTo(leadNichoMap, niche, "envios"); // reutiliza "envios" como contador de leads
          }
        } finally {
          client.release();
        }
      } catch {
        /* degrada silenciosamente */
      }
    }

    // ── Montagem da resposta ──
    const nichos = topBuckets(porNicho, 3).map((b) => ({
      nome: b.nome,
      envios: b.envios,
      respostas: b.respostas,
      reply_rate_pct: ratePct(b),
      leads_novos: leadNichoMap.get(b.nome)?.envios || 0,
    }));
    const cidades = topBuckets(porCidade, 3).map((b) => ({
      nome: b.nome,
      envios: b.envios,
      respostas: b.respostas,
      reply_rate_pct: ratePct(b),
    }));
    const horarios = [...porHorario.values()]
      .filter((b) => b.envios >= 2)
      .sort((a, b) => b.envios - a.envios)
      .slice(0, 8)
      .map((b) => ({ nome: b.nome, envios: b.envios, respostas: b.respostas, reply_rate_pct: ratePct(b) }));
    const variantes = topBuckets(porVariante, 3).map((b) => ({
      nome: b.nome,
      envios: b.envios,
      respostas: b.respostas,
      reply_rate_pct: ratePct(b),
    }));

    // ── Insights determinísticos ──
    const insights: string[] = [];
    const replyRateCur = curEnvios > 0 ? Math.round((curRespostas / curEnvios) * 100) : 0;
    const replyRatePrev = prevEnvios > 0 ? Math.round((prevRespostas / prevEnvios) * 100) : 0;

    const delta = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? `+${cur} novos` : "sem dados na semana anterior";
      const pct = Math.round(((cur - prev) / prev) * 100);
      return `${pct >= 0 ? "+" : ""}${pct}%`;
    };

    if (nichos[0]) insights.push(`🏆 Nicho campeão: "${nichos[0].nome}" — ${nichos[0].reply_rate_pct}% de resposta em ${nichos[0].envios} envios.`);
    if (cidades[0]) insights.push(`📍 Cidade mais responsiva: "${cidades[0].nome}" — ${cidades[0].reply_rate_pct}% de resposta.`);
    if (horarios[0]) {
      const melhor = [...horarios].sort((a, b) => b.reply_rate_pct - a.reply_rate_pct)[0];
      insights.push(`⏰ Melhor horário: ${melhor.nome} (${melhor.reply_rate_pct}% de resposta em ${melhor.envios} envios).`);
    }
    if (variantes.length > 1) {
      insights.push(`🎯 Variante campeã: "${variantes[0].nome}" — ${variantes[0].reply_rate_pct}% vs ${variantes[1].reply_rate_pct}% da "${variantes[1].nome}".`);
    }
    if (dbOk) {
      insights.push(`📈 Envios: ${delta(curEnvios, prevEnvios)} vs semana anterior (${curEnvios} vs ${prevEnvios}); resposta: ${delta(curRespostas, prevRespostas)} (${curRespostas} vs ${prevRespostas}).`);
    }
    insights.push(`🧲 Leads: ${delta(leadsAtual.length, leadsAnterior.length)} vs semana anterior (${leadsAtual.length} vs ${leadsAnterior.length}); ${avancadosAtual} avançaram de estágio; ${fechadosRows.length} fechou (R$ ${(fechadosRows.reduce((s, r) => s + (r.estimated_value_cents || 0), 0) / 100).toLocaleString("pt-BR")}).`);
    if (replyRateCur > 0 && replyRateCur < replyRatePrev) {
      insights.push(`⚠️ Reply rate caiu de ${replyRatePrev}% para ${replyRateCur}% — revise o público ou a variante de roteiro da semana.`);
    }
    if (insights.length === 0) insights.push("Ainda sem envios suficientes nos últimos 14 dias para comparar. Rode prospecção no Fluxo de Atendimento para gerar dados.");

    return NextResponse.json({
      janela: {
        atual: atual,
        anterior: anterior,
        db_envios_disponivel: dbOk,
      },
      resumo: {
        atual: {
          envios: curEnvios,
          respostas: curRespostas,
          reply_rate_pct: replyRateCur,
          novos_leads: leadsAtual.length,
          avancados: avancadosAtual,
          fechados: fechadosRows.length,
          valor_fechado_brl: fechadosRows.reduce((s, r) => s + (r.estimated_value_cents || 0), 0) / 100,
        },
        anterior: {
          envios: prevEnvios,
          respostas: prevRespostas,
          reply_rate_pct: replyRatePrev,
          novos_leads: leadsAnterior.length,
          fechados: fechadosAnterior,
        },
      },
      por_nicho: nichos,
      por_cidade: cidades,
      por_horario: horarios,
      por_variante: variantes,
      insights,
    });
  } catch (e: any) {
    console.error("[insights] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
