import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * POST /api/cron/telegram-digest — Digest diário no Telegram (Sprint C)
 *
 * Envia uma mensagem única com:
 *   - Leads esfriando (estágio ativo, 5+ dias sem interação) — com contexto
 *   - Propostas aguardando follow-up (2+ dias)
 *   - Oportunidades novas (7 dias)
 *   - Resumo do funil
 *
 * BOTÕES DE AÇÃO (inline keyboard, URLs):
 *   - "Abrir CRM"           → /admin/leads-crm
 *   - "Fluxo de Atendimento"→ /admin/fluxo-atendimento
 *   - "Insights Semanais"   → /admin/insights
 *
 * Segurança: protegido por CRON_SECRET (padrão dos outros crons).
 * Nível 1 — a notificação NÃO executa ações; os botões levam à tela onde
 * o Clodoaldo decide e executa manualmente.
 *
 * Env vars: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (falha silenciosa se ausentes).
 * Agendamento: vercel.json → 0 11 * * * (08h BRT, todo dia).
 */

const ACTIVE_STAGES = ["qualificado", "proposta", "negociacao"];
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clodoaldo.vercel.app";

function brl(cents: number | null | undefined): string {
  if (!cents) return "";
  return ` · R$ ${(cents / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function leadLine(l: any): string {
  const dias = Math.floor((Date.now() - new Date(l.updated_at || l.created_at).getTime()) / 86_400_000);
  return `• <b>${escapeHtml(l.name)}</b>${l.company ? ` (${escapeHtml(l.company)})` : ""}${brl(l.estimated_value_cents)} — ${dias}d sem interação`;
}

export async function POST(req: NextRequest) {
  // Auth check (padrão dos outros crons — Vercel envia Bearer CRON_SECRET)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/telegram-digest] CRON_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron/telegram-digest] unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getSupabaseServer();
    const now = Date.now();
    const coldCutoff = new Date(now - 5 * 86_400_000).toISOString();
    const followCutoff = new Date(now - 2 * 86_400_000).toISOString();
    const newCutoff = new Date(now - 7 * 86_400_000).toISOString();

    const [coldR, propR, newR, allR] = await Promise.all([
      sb.from("crm_leads")
        .select("id, name, company, stage, estimated_value_cents, updated_at")
        .in("stage", ACTIVE_STAGES)
        .lt("updated_at", coldCutoff)
        .order("updated_at", { ascending: true })
        .limit(5),
      sb.from("crm_leads")
        .select("id, name, company, estimated_value_cents, updated_at")
        .eq("stage", "proposta")
        .lt("updated_at", followCutoff)
        .order("updated_at", { ascending: true })
        .limit(5),
      sb.from("crm_leads")
        .select("id, name, company, source, estimated_value_cents, created_at")
        .eq("stage", "novo")
        .gte("created_at", newCutoff)
        .order("created_at", { ascending: false })
        .limit(5),
      sb.from("crm_leads").select("stage, estimated_value_cents"),
    ]);

    const cold = coldR.data || [];
    const props = propR.data || [];
    const novos = newR.data || [];
    const rows: any[] = allR.data || [];

    if (cold.length === 0 && props.length === 0 && novos.length === 0) {
      return NextResponse.json({ ok: true, skipped: "nada a reportar hoje", sent: false });
    }

    const porEstagio = ["novo", "qualificado", "proposta", "negociacao", "fechado"].map((stage) => {
      const rs = rows.filter((r) => r.stage === stage);
      const valor = rs.reduce((s, r) => s + (r.estimated_value_cents || 0), 0) / 100;
      return `${stage}: ${rs.length}${valor ? ` (R$ ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })})` : ""}`;
    });

    const partes: string[] = [];
    partes.push(`🤖 <b>Resumo do dia — Clodoaldo CRM</b>\n${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}`);

    if (novos.length > 0) {
      partes.push(`\n🟢 <b>Oportunidades novas (7d): ${novos.length}</b>\n${novos.map((l) => leadLine(l)).join("\n")}`);
    }
    if (props.length > 0) {
      partes.push(`\n📄 <b>Propostas aguardando follow-up: ${props.length}</b>\n${props.map((l) => leadLine(l)).join("\n")}`);
    }
    if (cold.length > 0) {
      partes.push(`\n❄️ <b>Leads esfriando (5d+ sem interação): ${cold.length}</b>\n${cold.map((l) => leadLine(l)).join("\n")}`);
    }
    partes.push(`\n📊 <b>Funil:</b> ${porEstagio.join(" · ")}`);
    partes.push(`\n⚠️ Ações (enviar WhatsApp, mudar status, cobrar) continuam manuais com você — a IA só monitora e prepara.`);

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Abrir CRM", url: `${BASE_URL}/admin/leads-crm` }],
        [{ text: "🔀 Fluxo de Atendimento", url: `${BASE_URL}/admin/fluxo-atendimento` }],
        [{ text: "🧠 Insights Semanais", url: `${BASE_URL}/admin/insights` }],
      ],
    };

    const sent = await sendTelegram({
      text: partes.join("\n"),
      parseMode: "HTML",
      replyMarkup: keyboard,
    });

    if (!sent) {
      return NextResponse.json({ ok: true, sent: false, reason: "Telegram não configurado (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID)" });
    }
    return NextResponse.json({ ok: true, sent: true, leads_esfriando: cold.length, propostas: props.length, novas: novos.length });
  } catch (e: any) {
    console.error("[telegram-digest] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
