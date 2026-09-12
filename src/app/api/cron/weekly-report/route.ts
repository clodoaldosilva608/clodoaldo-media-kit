import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { sendEmail } from "@/lib/gmail";
import { getConnectedEmail } from "@/lib/google-oauth";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * POST /api/cron/weekly-report
 *
 * Vercel Cron job — runs every Monday at 09:00 BRT (12:00 UTC).
 *
 * Generates a weekly summary email + Telegram notification with:
 *   - Total sends this week
 *   - Total replies received
 *   - Reply rate
 *   - Top niches prospected
 *   - Top campaigns
 *   - Pipeline breakdown (new / contacted / qualified / won / lost)
 *   - List of leads that replied (with classification)
 *
 * Auth: protected by CRON_SECRET env var.
 * Email destination: the connected Google account email (auto-detected).
 */

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/weekly-report] CRON_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron/weekly-report] unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow custom period via query param (default: 7 days for weekly cron)
  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") || 7), 1), 90);

  const report = await generateWeeklyReport(days);
  if (report.error) {
    return NextResponse.json({ error: report.error }, { status: 500 });
  }

  // Send via email
  let emailSent = false;
  let emailError: string | null = null;
  try {
    // Try to get connected email; fall back to admin email env var or hardcoded default
    let dest = await getConnectedEmail();
    if (!dest) {
      dest = process.env.ADMIN_EMAIL || "clodoaldo608@gmail.com";
    }
    if (dest) {
      const periodLabel = days === 7 ? "Semanal" : days === 14 ? "Quinzenal" : days === 30 ? "Mensal" : `${days} dias`;
      const result = await sendEmail(
        dest,
        `📊 Relatório ${periodLabel} — Clodoaldo Silva (${report.period.start} a ${report.period.end})`,
        report.html
      );
      emailSent = result.ok;
      emailError = result.error || null;
    } else {
      emailError = "Google não conectado — faça login em /admin/settings";
    }
  } catch (e: any) {
    emailError = e.message;
  }

  // Send via Telegram (always — as a backup)
  const telegramSent = await sendTelegram({
    text: report.telegramText,
    parseMode: "HTML",
  });

  return NextResponse.json({
    ok: true,
    period: report.period,
    stats: report.stats,
    emailSent,
    emailError,
    telegramSent,
  });
}

// =====================================================
// Report generation
// =====================================================
async function generateWeeklyReport(days: number = 7): Promise<{
  period: { start: string; end: string };
  stats: any;
  html: string;
  telegramText: string;
  error?: string;
}> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const period = { start: formatDate(startDate), end: formatDate(now) };

  try {
    const client = await getMeucorrePool().connect();
    try {
      // === Stats for the week ===
      const enviosStats = await client.query(
        `SELECT
            count(*)::int as total,
            count(*) filter (where status = 'sent')::int as sent,
            count(*) filter (where status = 'failed')::int as failed,
            count(DISTINCT prospect_id)::int as unique_leads
         FROM public.clodoaldo_envios
         WHERE sent_at >= $1`,
        [startDate.toISOString()]
      );
      const envios = enviosStats.rows[0] || {};

      const respostasStats = await client.query(
        `SELECT
            count(*)::int as total,
            count(*) filter (where classification = 'interessado')::int as interessado,
            count(*) filter (where classification = 'meeting_ready')::int as meeting_ready,
            count(*) filter (where classification = 'permission_to_send')::int as permission,
            count(*) filter (where classification = 'opt_out')::int as opt_out,
            count(*) filter (where classification = 'pricing_question')::int as pricing,
            count(*) filter (where classification = 'ambiguous')::int as ambiguous
         FROM public.clodoaldo_respostas
         WHERE received_at >= $1`,
        [startDate.toISOString()]
      );
      const respostas = respostasStats.rows[0] || {};

      // Top niches prospected this week
      const topNiches = await client.query(
        `SELECT
            p.niche,
            count(*)::int as envios,
            count(*) filter (where e.status = 'sent')::int as sent
         FROM public.clodoaldo_envios e
         JOIN public.clodoaldo_prospects p ON p.id = e.prospect_id::uuid
         WHERE e.sent_at >= $1 AND p.niche IS NOT NULL
         GROUP BY p.niche
         ORDER BY envios DESC
         LIMIT 5`,
        [startDate.toISOString()]
      );

      // Top campaigns this week
      const topCampaigns = await client.query(
        `SELECT
            campaign,
            count(*)::int as total,
            count(*) filter (where status = 'sent')::int as sent
         FROM public.clodoaldo_envios
         WHERE sent_at >= $1 AND campaign IS NOT NULL
         GROUP BY campaign
         ORDER BY total DESC
         LIMIT 5`,
        [startDate.toISOString()]
      );

      // Pipeline breakdown
      const pipeline = await client.query(
        `SELECT
            status,
            count(*)::int as total
         FROM public.clodoaldo_prospects
         GROUP BY status
         ORDER BY total DESC`
      );

      // Recent replies (last 10)
      const recentReplies = await client.query(
        `SELECT
            r.message_text,
            r.classification,
            r.received_at,
            p.name as prospect_name,
            p.niche
         FROM public.clodoaldo_respostas r
         LEFT JOIN public.clodoaldo_prospects p ON p.id = r.prospect_id::uuid
         WHERE r.received_at >= $1
         ORDER BY r.received_at DESC
         LIMIT 10`,
        [startDate.toISOString()]
      );

      const replyRate = envios.sent > 0 ? Math.round((respostas.total / envios.sent) * 100) : 0;

      const stats = {
        envios: envios.total || 0,
        enviosSent: envios.sent || 0,
        enviosFailed: envios.failed || 0,
        uniqueLeads: envios.unique_leads || 0,
        respostas: respostas.total || 0,
        replyRate,
        respostasBreakdown: {
          interessado: respostas.interessado || 0,
          meeting_ready: respostas.meeting_ready || 0,
          permission: respostas.permission || 0,
          opt_out: respostas.opt_out || 0,
          pricing: respostas.pricing || 0,
          ambiguous: respostas.ambiguous || 0,
        },
        topNiches: topNiches.rows,
        topCampaigns: topCampaigns.rows,
        pipeline: pipeline.rows,
        recentReplies: recentReplies.rows,
      };

      const html = buildEmailHtml(stats, period);
      const telegramText = buildTelegramText(stats, period);

      return { period, stats, html, telegramText };
    } finally {
      client.release();
    }
  } catch (e: any) {
    return { period, stats: {}, html: "", telegramText: "", error: e.message };
  }
}

// =====================================================
// Email HTML builder
// =====================================================
function buildEmailHtml(stats: any, period: any): string {
  const replyRate = stats.replyRate || 0;
  const respostas = stats.respostas || 0;
  const envios = stats.envios || 0;

  // Top niches rows
  const nichesRows = (stats.topNiches || [])
    .map((n: any) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${n.niche}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${n.envios}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${n.sent}</td></tr>`)
    .join("");

  // Top campaigns rows
  const campaignsRows = (stats.topCampaigns || [])
    .map((c: any) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${c.campaign}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${c.total}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${c.sent}</td></tr>`)
    .join("");

  // Pipeline rows
  const pipelineRows = (stats.pipeline || [])
    .map((p: any) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize;">${p.status}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${p.total}</td></tr>`)
    .join("");

  // Recent replies
  const repliesRows = (stats.recentReplies || [])
    .map((r: any) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${r.prospect_name || "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${r.niche || "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><span style="background:${classificationColor(r.classification)};color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;">${r.classification || "—"}</span></td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:11px;color:#666;">${new Date(r.received_at).toLocaleString("pt-BR")}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Relatório Semanal</title></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#10b981,#0ea5e9);padding:32px 24px;color:#fff;">
      <h1 style="margin:0;font-size:24px;font-weight:800;">📊 Relatório Semanal</h1>
      <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">Clodoaldo Silva — Prospecção & Disparos</p>
      <p style="margin:8px 0 0;opacity:0.8;font-size:12px;">Período: ${period.start} a ${period.end}</p>
    </div>

    <!-- KPIs -->
    <div style="padding:24px;">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;">
        <div style="background:#ecfdf5;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#10b981;">${envios}</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Disparos</div>
        </div>
        <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#3b82f6;">${respostas}</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Respostas</div>
        </div>
        <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#f59e0b;">${replyRate}%</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Taxa de resposta</div>
        </div>
        <div style="background:#f5f3ff;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#8b5cf6;">${stats.uniqueLeads || 0}</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Leads únicos</div>
        </div>
      </div>

      <!-- Top Niches -->
      ${nichesRows ? `
      <h2 style="font-size:16px;color:#333;margin:24px 0 12px;">🏆 Top nichos prospectados</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Nicho</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #eee;">Disparos</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #eee;">Enviados</th></tr></thead>
        <tbody>${nichesRows}</tbody>
      </table>` : ""}

      <!-- Top Campaigns -->
      ${campaignsRows ? `
      <h2 style="font-size:16px;color:#333;margin:24px 0 12px;">📣 Top campanhas</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Campanha</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #eee;">Total</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #eee;">Enviados</th></tr></thead>
        <tbody>${campaignsRows}</tbody>
      </table>` : ""}

      <!-- Pipeline -->
      ${pipelineRows ? `
      <h2 style="font-size:16px;color:#333;margin:24px 0 12px;">📊 Pipeline (total acumulado)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Status</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #eee;">Total</th></tr></thead>
        <tbody>${pipelineRows}</tbody>
      </table>` : ""}

      <!-- Recent Replies -->
      ${repliesRows ? `
      <h2 style="font-size:16px;color:#333;margin:24px 0 12px;">💬 Respostas recentes (última semana)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Lead</th><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Nicho</th><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Classificação</th><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #eee;">Recebida</th></tr></thead>
        <tbody>${repliesRows}</tbody>
      </table>` : ""}

      <!-- CTA -->
      <div style="margin-top:32px;text-align:center;">
        <a href="https://clodoaldo-media-kit.vercel.app/admin/parceiros" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Ver detalhes no admin →</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
      Relatório automático enviado pelo sistema Clodoaldo Silva • ${new Date().toLocaleString("pt-BR")}
    </div>
  </div>
</body>
</html>`;
}

function classificationColor(c: string): string {
  const colors: Record<string, string> = {
    permission_to_send: "#3b82f6",
    interessado: "#10b981",
    meeting_ready: "#059669",
    opt_out: "#ef4444",
    pricing_question: "#f59e0b",
    ambiguous: "#71717a",
    unclassified: "#71717a",
  };
  return colors[c] || "#71717a";
}

// =====================================================
// Telegram text builder (concise version)
// =====================================================
function buildTelegramText(stats: any, period: any): string {
  const replyRate = stats.replyRate || 0;
  const lines: string[] = [
    `📊 <b>Relatório Semanal</b>`,
    `📅 ${period.start} a ${period.end}`,
    ``,
    `<b>Disparos:</b> ${stats.envios || 0} (${stats.enviosSent || 0} enviados)`,
    `<b>Respostas:</b> ${stats.respostas || 0}`,
    `<b>Taxa de resposta:</b> ${replyRate}%`,
    `<b>Leads únicos:</b> ${stats.uniqueLeads || 0}`,
  ];

  // Respostas breakdown
  const rb = stats.respostasBreakdown || {};
  if (stats.respostas > 0) {
    lines.push(``);
    lines.push(`<b>Classificação das respostas:</b>`);
    if (rb.interessado) lines.push(`🔥 Interessados: ${rb.interessado}`);
    if (rb.meeting_ready) lines.push(`📅 Querem reunião: ${rb.meeting_ready}`);
    if (rb.permission) lines.push(`✅ Permitiram info: ${rb.permission}`);
    if (rb.pricing) lines.push(`💰 Pergunta de preço: ${rb.pricing}`);
    if (rb.opt_out) lines.push(`🚫 Não querem: ${rb.opt_out}`);
    if (rb.ambiguous) lines.push(`❓ Ambíguos: ${rb.ambiguous}`);
  }

  // Top niches
  if (stats.topNiches && stats.topNiches.length > 0) {
    lines.push(``);
    lines.push(`<b>Top nichos:</b>`);
    stats.topNiches.slice(0, 3).forEach((n: any) => {
      lines.push(`• ${escapeHtml(n.niche)}: ${n.envios} disparos`);
    });
  }

  lines.push(``);
  lines.push(`👉 <a href="https://clodoaldo-media-kit.vercel.app/admin/parceiros">Ver detalhes no admin</a>`);

  return lines.join("\n");
}
