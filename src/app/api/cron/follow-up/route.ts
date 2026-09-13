import { NextRequest, NextResponse } from "next/server";
import { sendTelegram, escapeHtml } from "@/lib/telegram";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * POST /api/cron/follow-up
 *
 * Vercel Cron — runs daily at 10:00 BRT (13:00 UTC).
 * Schedule: "0 13 * * *"
 *
 * Verifica leads contactados há +3 dias sem resposta.
 * Manda Telegram com lista de leads esfriando + links de follow-up.
 *
 * Auth: protected by CRON_SECRET
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pool = getMeucorrePool();
    const client = await pool.connect();

    try {
      // Busca leads contactados há +3 dias, sem resposta, não perdidos/fechados
      const result = await client.query(
        `SELECT id, name, whatsapp, niche, city, has_website, rating,
                last_contact_at, contacted_count, message_variant
         FROM clodoaldo_prospects
         WHERE send_status = 'sent'
           AND replied = false
           AND status NOT IN ('perdido', 'fechado')
           AND last_contact_at IS NOT NULL
           AND last_contact_at < now() - interval '3 days'
         ORDER BY last_contact_at ASC
         LIMIT 50`
      );

      const leads = result.rows;
      const today = new Date().toLocaleDateString("pt-BR");

      if (leads.length === 0) {
        await sendTelegram({
          text: `🔄 <b>Follow-up — ${today}</b>\n\n✅ Nenhum lead esfriando. Todos os contactados foram respondidos ou estão dentro do prazo de 3 dias.`,
          parseMode: "HTML",
        });
        return NextResponse.json({ ok: true, esfriando: 0 });
      }

      // Agrupa por urgência
      const criticos = leads.filter(l => {
        const days = (Date.now() - new Date(l.last_contact_at).getTime()) / (1000 * 60 * 60 * 24);
        return days >= 7;
      });
      const urgentes = leads.filter(l => {
        const days = (Date.now() - new Date(l.last_contact_at).getTime()) / (1000 * 60 * 60 * 24);
        return days >= 3 && days < 7;
      });

      // Monta mensagem Telegram
      const lines: string[] = [
        `🔄 <b>Follow-up — ${today}</b>`,
        `📊 ${leads.length} leads esfriando sem resposta`,
        `❄️ ${criticos.length} críticos (+7 dias) | 🌡️ ${urgentes.length} urgentes (3-7 dias)`,
        ``,
        `<b>👇 Clique pra enviar follow-up:</b>`,
        ``,
      ];

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clodoaldo-media-kit.vercel.app";
      const crmUrl = `${siteUrl}/admin/leads-crm`;

      leads.slice(0, 20).forEach((lead, i) => {
        const days = Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / (1000 * 60 * 60 * 24));
        const emoji = days >= 7 ? "❄️" : "🌡️";
        const num = lead.whatsapp?.replace(/\D/g, "") || "";
        const waNum = num.startsWith("55") ? num : `55${num}`;

        // Mensagem de follow-up personalizada
        const followUpMsg = `Oi ${lead.name}! Tudo bem?\n\nEnviei um site demo pra vocês alguns dias atrás. Como sei que a rotina é corrida, estou voltando pra garantir que você viu.\n\nSe não faz sentido agora, sem problema — me avisa. Mas se fizer sentido, é só responder este WhatsApp.`;
        const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(followUpMsg)}`;

        lines.push(`<b>${i + 1}. ${emoji} ${escapeHtml(lead.name)}</b>`);
        lines.push(`📅 Há ${days} dias | ${lead.contacted_count || 1}x contactado | ${lead.niche || "?"} | ${lead.city || "?"}`);
        lines.push(`💬 <a href="${waLink}">Enviar follow-up no WhatsApp</a>`);
        lines.push(``);
      });

      if (leads.length > 20) {
        lines.push(`+ ${leads.length - 20} leads adicionais. Veja todos no <a href="${crmUrl}">CRM</a>.`);
      }

      lines.push(``);
      lines.push(`💡 <b>Estratégia:</b> Use a variante de follow-up A (soft) ou B (curiosity) na aba Scripts WhatsApp.`);

      await sendTelegram({
        text: lines.join("\n"),
        parseMode: "HTML",
        disablePreview: true,
      });

      return NextResponse.json({
        ok: true,
        esfriando: leads.length,
        criticos: criticos.length,
        urgentes: urgentes.length,
      });
    } finally {
      client.release();
    }
  } catch (e: any) {
    console.error("[cron/follow-up] Error:", e);
    await sendTelegram({
      text: `❌ <b>Erro no follow-up cron</b>\n\n${escapeHtml(e.message)}`,
      parseMode: "HTML",
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
