import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/assistant — IA Assistente da admin (Sprint B)
 *
 * Chat conversacional (estilo ChatGPT) sobre leads, nichos, conversões,
 * prioridades e roteiros. Usa Gemini com FUNCTION CALLING sobre 5 ferramentas
 * SOMENTE LEITURA (Nível 1 do modelo de autonomia de 3 níveis):
 *
 *   1. list_leads(filter)   — lista leads com filtros opcionais
 *   2. get_lead(id)         — detalhe completo de 1 lead (+ memória do agente)
 *   3. get_cold_leads()     — leads esfriando (sem follow-up há dias)
 *   4. get_hot_leads()      — leads quentes (momento de atacar)
 *   5. get_funnel_stats()   — funil: contagem/valor por estágio + gargalos
 *
 * SEGURANÇA (contrato da conversa de planejamento — NÃO RELAXAR):
 * - A IA é um "chief of staff" de monitoramento e preparação, NÃO executora.
 * - Nenhuma ferramenta de escrita/ação é exposta neste endpoint.
 * - Proibições: enviar WhatsApp, deletar dados, alterar status comercial,
 *   criar cobranças — tudo isso permanece manual (Nível 3).
 *
 * Body: { question: string, history?: Array<{ role: "user" | "model", text: string }> }
 * Resp: { answer: string, tool_calls: Array<{ name, args }>, actions_suggested: string[] }
 */

const STAGES = ["novo", "qualificado", "proposta", "negociacao", "fechado", "perdido"] as const;
const ACTIVE_STAGES = ["qualificado", "proposta", "negociacao"];

const COLD_AFTER_DAYS = 5; // sem interação há X dias = esfriando
const HOT_RECENT_DAYS = 3; // interação nos últimos X dias + estágio avançado = quente

// ─────────────────────────────────────────────────────────────────────────────
// Ferramentas read-only (executadas server-side contra o Supabase)
// ─────────────────────────────────────────────────────────────────────────────

type LeadRow = Record<string, any>;

function leadSummary(l: LeadRow) {
  return {
    id: l.id,
    name: l.name,
    company: l.company,
    whatsapp: l.whatsapp,
    email: l.email,
    stage: l.stage,
    estimated_value_brl: l.estimated_value_cents ? l.estimated_value_cents / 100 : null,
    budget_range: l.budget_range,
    deadline: l.deadline,
    intent: l.intent,
    project_idea: l.project_idea,
    source: l.source,
    bant: {
      budget: l.bant_budget ?? null,
      authority: l.bant_authority ?? null,
      need: l.bant_need ?? null,
      timing: l.bant_timing ?? null,
    },
    site_status: l.site_status,
    demo_url: l.demo_url,
    created_at: l.created_at,
    updated_at: l.updated_at,
    dias_sem_interacao: l.updated_at
      ? Math.floor((Date.now() - new Date(l.updated_at).getTime()) / 86_400_000)
      : null,
  };
}

async function toolListLeads(filter: any) {
  const sb = getSupabaseServer();
  const limit = Math.min(Number(filter?.limit) || 20, 50);
  let q = sb.from("crm_leads").select("*").order("updated_at", { ascending: false }).limit(limit);
  if (filter?.stage && STAGES.includes(filter.stage)) q = q.eq("stage", filter.stage);
  if (filter?.search) q = q.or(`name.ilike.%${filter.search}%,company.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`);
  const { data, error } = await q;
  if (error) return { error: error.message };
  const leads = (data || []).map(leadSummary);
  return {
    total: leads.length,
    dica: "Use get_lead(id) para detalhes completos de um lead específico.",
    leads,
  };
}

async function toolGetLead(id: any) {
  if (!id || typeof id !== "string") return { error: "id obrigatório" };
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("crm_leads").select("*").eq("id", id).maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Lead não encontrado" };
  const lead = data as LeadRow;
  // Memória persistente do agente (temperatura, objeções, resumo) se existir
  const { data: mem } = (await sb.from("agent_memory").select("*").eq("lead_id", id).maybeSingle()) as any;
  return {
    lead: leadSummary(lead),
    notes: lead.notes,
    memoria_agente: mem
      ? {
          temperatura_atual: Array.isArray(mem.temperature_history)
            ? mem.temperature_history[mem.temperature_history.length - 1]
            : null,
          historico_temperatura: mem.temperature_history,
          resumo_conversas: mem.conversation_summary,
          objecoes: mem.key_objections,
          proxima_acao_sugerida: mem.next_action_suggested,
          conversas_registradas: mem.conversation_count,
        }
      : null,
  };
}

/** Leads esfriando: estágio ativo mas sem interação há COLD_AFTER_DAYS+ dias */
async function toolGetColdLeads() {
  const sb = getSupabaseServer();
  const cutoff = new Date(Date.now() - COLD_AFTER_DAYS * 86_400_000).toISOString();
  const { data, error } = await sb
    .from("crm_leads")
    .select("*")
    .in("stage", ACTIVE_STAGES)
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(30);
  if (error) return { error: error.message };
  const leads = (data || []).map(leadSummary);
  return {
    definicao: `Estágio ativo (qualificado/proposta/negociação) sem interação há ${COLD_AFTER_DAYS}+ dias`,
    total: leads.length,
    leads,
  };
}

/** Leads quentes: estágio avançado com interação recente (ou BANT completo) */
async function toolGetHotLeads() {
  const sb = getSupabaseServer();
  const cutoff = new Date(Date.now() - HOT_RECENT_DAYS * 86_400_000).toISOString();
  const { data, error } = await sb
    .from("crm_leads")
    .select("*")
    .in("stage", ["proposta", "negociacao"])
    .gte("updated_at", cutoff)
    .order("updated_at", { ascending: false })
    .limit(30);
  if (error) return { error: error.message };
  const leads = (data || []).map(leadSummary);
  return {
    definicao: `Proposta/negociação com interação nos últimos ${HOT_RECENT_DAYS} dias — momento de atacar`,
    total: leads.length,
    leads,
  };
}

/** Funil completo: contagem e valor por estágio, conversão e gargalos */
async function toolGetFunnelStats() {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("crm_leads").select("stage, estimated_value_cents, created_at, updated_at");
  if (error) return { error: error.message };
  const rows = data || [];

  const porEstagio = STAGES.map((stage) => {
    const rs = rows.filter((r: any) => r.stage === stage);
    const valor = rs.reduce((s: number, r: any) => s + (r.estimated_value_cents || 0), 0);
    const diasMedios = rs.length
      ? Math.round(
          rs.reduce((s: number, r: any) => s + (Date.now() - new Date(r.updated_at).getTime()) / 86_400_000, 0) /
            rs.length
        )
      : 0;
    return {
      stage,
      count: rs.length,
      valor_total_brl: valor / 100,
      dias_desde_ultima_interacao_media: diasMedios,
    };
  });

  const total = rows.length;
  const fechados = rows.filter((r: any) => r.stage === "fechado").length;
  const ativos = rows.filter((r: any) => ACTIVE_STAGES.includes(r.stage)).length;
  const gargalo = [...porEstagio]
    .filter((e) => ACTIVE_STAGES.includes(e.stage) && e.count > 0)
    .sort((a, b) => b.dias_desde_ultima_interacao_media - a.dias_desde_ultima_interacao_media)[0] || null;

  return {
    total_leads: total,
    ativos_em_negociacao: ativos,
    taxa_conversao_fechamento_pct: total ? Math.round((fechados / total) * 1000) / 10 : 0,
    por_estagio: porEstagio,
    gargalo_principal: gargalo
      ? {
          stage: gargalo.stage,
          motivo: `leads parados há em média ${gargalo.dias_desde_ultima_interacao_media} dias sem interação`,
        }
      : null,
  };
}

const TOOLS: Record<string, (args: any) => Promise<any>> = {
  list_leads: toolListLeads,
  get_lead: toolGetLead,
  get_cold_leads: toolGetColdLeads,
  get_hot_leads: toolGetHotLeads,
  get_funnel_stats: toolGetFunnelStats,
};

const FUNCTION_DECLARATIONS = [
  {
    name: "list_leads",
    description: "Lista leads do CRM com filtros opcionais. Use para perguntas como 'leads de restaurante', 'últimos leads', 'leads em proposta'.",
    parameters: {
      type: "OBJECT",
      properties: {
        stage: { type: "STRING", description: `Estágio do funil. Um de: ${STAGES.join(", ")}` },
        search: { type: "STRING", description: "Busca textual por nome, empresa ou notas" },
        limit: { type: "NUMBER", description: "Máximo de leads (padrão 20, máximo 50)" },
      },
    },
  },
  {
    name: "get_lead",
    description: "Retorna o detalhe completo de UM lead pelo id, incluindo memória do agente (temperatura, objeções, resumo de conversas).",
    parameters: {
      type: "OBJECT",
      properties: { id: { type: "STRING", description: "UUID do lead no crm_leads" } },
      required: ["id"],
    },
  },
  {
    name: "get_cold_leads",
    description: "Leads ESFRIANDO: em estágio ativo (qualificado/proposta/negociação) mas sem interação há 5+ dias. Precisam de follow-up.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_hot_leads",
    description: "Leads QUENTES: em proposta/negociação com interação nos últimos 3 dias — momento ideal para atacar.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_funnel_stats",
    description: "Estatísticas do funil: contagem e valor por estágio, taxa de conversão, tempo médio sem interação e gargalo principal.",
    parameters: { type: "OBJECT", properties: {} },
  },
];

const SYSTEM_PROMPT = `Você é a IA Assistente do Clodoaldo Silva — um "chief of staff" digital de MONITORAMENTO E PREPARAÇÃO do negócio dele (criação de sites e marketing digital local em Recife/PE).

SEU PAPEL (contrato fixo, não negociável):
- Monitorar o funil, priorizar leads, preparar respostas e sugerir a próxima ação.
- Responder perguntas sobre leads, estágios do funil, valores, objeções, prioridades e roteiros de abordagem.
- Sempre que útil, cite nomes, valores em R$, dias sem interação e a ação recomendada.

MODELO DE 3 NÍVEIS DE AUTONOMIA (você opera APENAS no Nível 1):
- Nível 1 (você): monitorar, calcular, sugerir, resumir. Tudo que você faz aqui é somente leitura.
- Nível 2 (existe fora de você): preparar roteiro/proposta que o Clodoaldo aprova com 1 clique.
- Nível 3 (nunca seu): envio de WhatsApp/e-mail, exclusão, fechamento, cobrança no Asaas — sempre manual.

PROIBIÇÕES ABSOLUTAS (devem aparecer na sua conduta, não só no código):
- Você NÃO envia mensagens, NÃO deleta nada, NÃO muda status de leads, NÃO cria cobranças.
- Se pedirem qualquer ação dessas, explique que por segurança isso é manual (Nível 3) e ofereça a preparação: o texto pronto, o argumento, a sugestão de timing.

ESTILO DE RESPOSTA:
- Português brasileiro direto e prático, como um analista de vendas sênior.
- Respostas curtas e escaneáveis: use listas curtas e destaque números importantes.
- Sempre termine com "Próxima ação sugerida:" quando houver algo a fazer.
- Não invente dados: se a ferramenta não retornou a informação, diga o que falta e sugira qual consulta supre (ou peça ao Clodoaldo para verificar no CRM).`;

// ─────────────────────────────────────────────────────────────────────────────
// POST — chat com function calling
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body?.question || "").toString().trim();
    const history: Array<{ role: string; text: string }> = Array.isArray(body?.history) ? body.history : [];

    if (!question) {
      return NextResponse.json({ error: "Campo 'question' é obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    const contents: any[] = [
      ...history.slice(-10).map((m) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: String(m.text || "").slice(0, 4000) }],
      })),
      { role: "user", parts: [{ text: question }] },
    ];

    const toolCallsExecuted: Array<{ name: string; args: any }> = [];

    // Loop de function calling (máx. 6 iterações p/ evitar custo descontrolado)
    for (let i = 0; i < 6; i++) {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!resp.ok) {
        const errText = await resp.text();
        return NextResponse.json({ error: `Gemini ${resp.status}: ${errText.slice(0, 200)}` }, { status: 502 });
      }

      const data = await resp.json();
      const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
      const callPart = parts.find((p) => p?.functionCall);
      const textPart = parts.find((p) => typeof p?.text === "string" && p.text.trim());

      // Sem chamada de função → resposta final
      if (!callPart) {
        const answer = textPart?.text?.trim() || "Não consegui gerar uma resposta. Tente reformular a pergunta.";
        const actionsSuggested = extractNextAction(answer);
        return NextResponse.json({ answer, tool_calls: toolCallsExecuted, actions_suggested: actionsSuggested });
      }

      // Executa a ferramenta pedida
      const fnName = callPart.functionCall?.name;
      const fnArgs = callPart.functionCall?.args || {};
      const fn = TOOLS[fnName];

      console.log(`[assistant] tool call: ${fnName}`, JSON.stringify(fnArgs).slice(0, 200));

      let result: any;
      if (!fn) {
        result = { error: `Ferramenta desconhecida: ${fnName}` };
      } else {
        try {
          result = await fn(fnArgs);
          toolCallsExecuted.push({ name: fnName, args: fnArgs });
        } catch (e: any) {
          result = { error: e.message };
        }
      }

      contents.push(data.candidates[0].content); // preserva o turn do model com o functionCall
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: fnName, response: { result } } }],
      });
    }

    // Excedeu o loop — pede resposta direta
    return NextResponse.json({
      answer:
        "Consultei os dados mas atingi o limite de consultas encadeadas desta mensagem. Refine a pergunta (ex.: 'quais leads esfriando?' ou 'funil da semana') que eu respondo com precisão.",
      tool_calls: toolCallsExecuted,
      actions_suggested: [],
    });
  } catch (e: any) {
    console.error("[assistant] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function extractNextAction(answer: string): string[] {
  const lines = answer.split("\n").map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => /pr[óo]xima a[çc][ãa]o/i.test(l));
  if (idx === -1) return [];
  const block = [lines[idx]];
  for (let i = idx + 1; i < lines.length && i <= idx + 3; i++) {
    if (/^[-•\d]/.test(lines[i]) || block.length === 1) block.push(lines[i]);
    else break;
  }
  return block.map((l) => l.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, ""));
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Resumo do dia (determinístico, sem custo de IA)
// Blocos: leads esfriando · propostas aguardando follow-up ·
//         oportunidades novas · gargalos do funil
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const sb = getSupabaseServer();

    const now = Date.now();
    const coldCutoff = new Date(now - COLD_AFTER_DAYS * 86_400_000).toISOString();
    const followCutoff = new Date(now - 2 * 86_400_000).toISOString();
    const newCutoff = new Date(now - 7 * 86_400_000).toISOString();

    const [coldR, propR, newR, allR] = await Promise.all([
      // Leads esfriando: estágio ativo, sem interação há 5+ dias
      sb.from("crm_leads")
        .select("id, name, company, stage, estimated_value_cents, updated_at")
        .in("stage", ACTIVE_STAGES)
        .lt("updated_at", coldCutoff)
        .order("updated_at", { ascending: true })
        .limit(10),
      // Propostas aguardando follow-up: estágio "proposta" há 2+ dias
      sb.from("crm_leads")
        .select("id, name, company, estimated_value_cents, updated_at")
        .eq("stage", "proposta")
        .lt("updated_at", followCutoff)
        .order("updated_at", { ascending: true })
        .limit(10),
      // Oportunidades novas: últimos 7 dias em estágio inicial
      sb.from("crm_leads")
        .select("id, name, company, source, estimated_value_cents, created_at")
        .eq("stage", "novo")
        .gte("created_at", newCutoff)
        .order("created_at", { ascending: false })
        .limit(10),
      // Todos p/ gargalos
      sb.from("crm_leads").select("stage, estimated_value_cents, updated_at"),
    ]);

    const leadCard = (l: any) => ({
      id: l.id,
      name: l.name,
      company: l.company || null,
      valor_brl: l.estimated_value_cents ? l.estimated_value_cents / 100 : null,
      updated_at: l.updated_at || l.created_at,
      dias_parado: Math.floor((now - new Date(l.updated_at || l.created_at).getTime()) / 86_400_000),
    });

    const rows: any[] = allR.data || [];
    const porEstagio = STAGES.map((stage) => {
      const rs = rows.filter((r) => r.stage === stage);
      const diasMedios = rs.length
        ? Math.round(rs.reduce((s, r) => s + (now - new Date(r.updated_at).getTime()) / 86_400_000, 0) / rs.length)
        : 0;
      return { stage, count: rs.length, dias_medios_parados: diasMedios };
    });
    const gargalos = porEstagio
      .filter((e) => ACTIVE_STAGES.includes(e.stage) && e.count > 0 && e.dias_medios_parados >= COLD_AFTER_DAYS)
      .sort((a, b) => b.dias_medios_parados - a.dias_medios_parados);

    return NextResponse.json({
      gerado_em: new Date().toISOString(),
      resumo: {
        leads_esfriando: {
          total: coldR.data?.length || 0,
          leads: (coldR.data || []).map(leadCard),
        },
        propostas_aguardando_followup: {
          total: propR.data?.length || 0,
          leads: (propR.data || []).map(leadCard),
        },
        oportunidades_novas: {
          total: newR.data?.length || 0,
          leads: (newR.data || []).map(leadCard),
        },
        gargalos_funil: {
          definicao: "estágios ativos com leads parados há 5+ dias em média",
          itens: gargalos,
        },
      },
    });
  } catch (e: any) {
    console.error("[assistant] GET summary error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
