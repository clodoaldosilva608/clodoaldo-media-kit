import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * GET /api/admin/respostas?limit=200
 * Returns the replies log joined with prospect name/niche/city.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const limit = Math.min(Number(url.searchParams.get("limit") || 200), 2000);

    const client = await getMeucorrePool().connect();
    try {
      const result = await client.query(
        `SELECT
            r.id,
            r.prospect_id,
            r.received_at,
            r.message_text,
            r.classification,
            r.action_taken,
            r.next_step,
            p.name AS prospect_name,
            p.niche AS prospect_niche,
            p.city AS prospect_city,
            p.whatsapp AS prospect_whatsapp,
            p.phone AS prospect_phone
         FROM public.clodoaldo_respostas r
         LEFT JOIN public.clodoaldo_prospects p ON p.id = r.prospect_id::uuid
         ORDER BY r.received_at DESC
         LIMIT $1`,
        [limit]
      );
      return NextResponse.json({ data: result.rows, error: null });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message });
  }
}

/**
 * POST /api/admin/respostas
 * Body: { prospect_id, message_text, classification?, action_taken?, next_step? }
 *
 * Registers a new reply in the log AND sends a Telegram notification
 * to Clodoaldo so he can act on it immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.message_text) {
      return NextResponse.json({ error: "Missing message_text" }, { status: 400 });
    }

    const client = await getMeucorrePool().connect();
    let prospect: any = null;
    try {
      // === Validate prospect_id is a real UUID (same logic as envios) ===
      let prospectUuid: string | null = null;
      if (body.prospect_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(String(body.prospect_id))) {
          prospectUuid = body.prospect_id;
        } else {
          // Not a UUID — try to look up by place_id
          try {
            const lookup = await client.query(
              "SELECT id FROM public.clodoaldo_prospects WHERE place_id = $1 LIMIT 1",
              [body.prospect_id]
            );
            if (lookup.rows.length > 0) {
              prospectUuid = lookup.rows[0].id;
            }
          } catch {}
        }
      }

      const cols = [
        "prospect_id",
        "message_text",
        "classification",
        "action_taken",
        "next_step",
        "received_at",
      ];
      const values: any[] = [];
      const placeholders: string[] = [];
      let idx = 1;

      const insertBody: any = { ...body };
      if (prospectUuid) {
        insertBody.prospect_id = prospectUuid;
      } else {
        delete insertBody.prospect_id;
      }

      for (const col of cols) {
        if (insertBody[col] !== undefined) {
          values.push(insertBody[col]);
          placeholders.push(`$${idx++}`);
        }
      }
      const colNames = cols.filter((c) => insertBody[c] !== undefined);

      let sql: string;
      if (colNames.includes("received_at")) {
        sql = `INSERT INTO public.clodoaldo_respostas (${colNames.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`;
      } else {
        sql = `INSERT INTO public.clodoaldo_respostas (${colNames.join(",")}, received_at) VALUES (${placeholders.join(",")}, now()) RETURNING *`;
      }
      const result = await client.query(sql, values);
      const inserted = result.rows[0];

      // Fetch prospect info for Telegram notification
      if (prospectUuid) {
        try {
          const pRes = await client.query(
            "SELECT name, niche, city, whatsapp, phone FROM public.clodoaldo_prospects WHERE id = $1",
            [prospectUuid]
          );
          if (pRes.rows.length > 0) {
            prospect = pRes.rows[0];

            // Update prospect: mark as replied
            try {
              await client.query(
                `UPDATE public.clodoaldo_prospects
                 SET replied = true,
                     reply_text = $1,
                     reply_classification = $2,
                     reply_at = now(),
                     status = CASE
                       WHEN $2 IN ('interessado', 'meeting_ready', 'permission_to_send') THEN 'qualified'
                       WHEN $2 = 'opt_out' THEN 'lost'
                       ELSE status
                     END,
                     updated_at = now()
                 WHERE id = $3`,
                [body.message_text, body.classification || "unclassified", prospectUuid]
              );
            } catch {}
          }
        } catch {}
      }

      // === Send Telegram notification ===
      if (prospect) {
        await notifyReplyTelegram({
          prospectName: prospect.name,
          niche: prospect.niche,
          city: prospect.city,
          whatsapp: prospect.whatsapp || prospect.phone,
          messageText: body.message_text,
          classification: body.classification || "unclassified",
          receivedAt: inserted.received_at,
        });
      }

      return NextResponse.json({ data: inserted, ok: true });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * Sends a Telegram notification when a lead replies.
 */
async function notifyReplyTelegram(input: {
  prospectName: string;
  niche?: string;
  city?: string;
  whatsapp?: string;
  messageText: string;
  classification: string;
  receivedAt: string;
}): Promise<void> {
  const classificationLabels: Record<string, { emoji: string; label: string; color: string }> = {
    permission_to_send: { emoji: "✅", label: "Permitiu enviar info", color: "info" },
    interessado: { emoji: "🔥", label: "Interessado", color: "success" },
    meeting_ready: { emoji: "📅", label: "Quer reunião", color: "success" },
    opt_out: { emoji: "🚫", label: "Não quer mais receber", color: "danger" },
    pricing_question: { emoji: "💰", label: "Pergunta de preço", color: "warning" },
    ambiguous: { emoji: "❓", label: "Ambíguo", color: "muted" },
    unclassified: { emoji: "📋", label: "Sem classificação", color: "muted" },
  };
  const cInfo = classificationLabels[input.classification] || classificationLabels.unclassified;

  const waNum = (input.whatsapp || "").replace(/\D/g, "");
  const waLink = waNum ? `https://wa.me/${waNum}` : "";

  const text = [
    `💬 <b>Lead respondeu!</b>`,
    ``,
    `<b>Estabelecimento:</b> ${escapeHtml(input.prospectName)}`,
    input.niche ? `<b>Nicho:</b> ${escapeHtml(input.niche)}` : "",
    input.city ? `<b>Cidade:</b> ${escapeHtml(input.city)}` : "",
    `<b>Classificação:</b> ${cInfo.emoji} ${cInfo.label}`,
    `<b>Recebida em:</b> ${new Date(input.receivedAt).toLocaleString("pt-BR")}`,
    ``,
    `<b>Mensagem:</b>`,
    `<i>${escapeHtml(input.messageText.slice(0, 500))}${input.messageText.length > 500 ? "…" : ""}</i>`,
  ].filter(Boolean).join("\n");

  await sendTelegram({
    text,
    parseMode: "HTML",
    replyMarkup: waLink ? {
      inline_keyboard: [
        [
          { text: "💬 Responder no WhatsApp", url: waLink },
          { text: "🔗 Ver no admin", url: "https://clodoaldo.vercel.app/admin/parceiros" },
        ],
      ],
    } : {
      inline_keyboard: [
        [{ text: "🔗 Ver no admin", url: "https://clodoaldo.vercel.app/admin/parceiros" }],
      ],
    },
  });
}
