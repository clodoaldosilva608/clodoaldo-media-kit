import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * POST /api/whatsapp/webhook
 *
 * Receives incoming WhatsApp messages from the external Baileys service.
 * Forwards to Telegram and registers in the system.
 *
 * Body: { from: "5581994057216", text: "message", timestamp: 123, fromMe: false }
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== "clodoaldo-whatsapp-secret-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { from, text, timestamp, fromMe } = body;

    if (!from || !text) {
      return NextResponse.json({ error: "Missing from or text" }, { status: 400 });
    }

    console.log(`[whatsapp-webhook] Message from ${from}: ${text.slice(0, 80)}`);

    // Skip messages sent by us
    if (fromMe) {
      return NextResponse.json({ ok: true, skipped: "fromMe" });
    }

    // Find the prospect by phone number
    const phoneDigits = from.replace(/\D/g, "");
    let prospect: any = null;

    try {
      const client = await getMeucorrePool().connect();
      try {
        // Try exact match on whatsapp field
        let result = await client.query(
          "SELECT id, name, niche, city, whatsapp, phone FROM clodoaldo_prospects WHERE whatsapp = $1 OR phone = $1 OR REPLACE(REPLACE(REPLACE(whatsapp, '(', ''), ')', ''), '-', '') = $1 OR REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', '') = $1 LIMIT 1",
          [phoneDigits]
        );

        if (result.rows.length === 0) {
          // Try with 55 prefix variation
          const phoneVariations = [phoneDigits, phoneDigits.replace(/^55/, ""), "55" + phoneDigits];
          for (const p of phoneVariations) {
            result = await client.query(
              "SELECT id, name, niche, city, whatsapp, phone FROM clodoaldo_prospects WHERE whatsapp LIKE '%' || $1 OR phone LIKE '%' || $1 LIMIT 1",
              [p]
            );
            if (result.rows.length > 0) break;
          }
        }

        if (result.rows.length > 0) {
          prospect = result.rows[0];
        }
      } finally {
        client.release();
      }
    } catch (e) {
      console.error("[whatsapp-webhook] DB error:", e);
    }

    // Register reply in the system
    let replyId = null;
    if (prospect) {
      try {
        const client = await getMeucorrePool().connect();
        try {
          // Insert reply
          const insertResult = await client.query(
            `INSERT INTO public.clodoaldo_respostas (prospect_id, message_text, classification, action_taken, next_step, received_at)
             VALUES ($1, $2, 'unclassified', 'Recebido via WhatsApp automático', NULL, now())
             RETURNING id`,
            [prospect.id, text]
          );
          replyId = insertResult.rows[0]?.id;

          // Update prospect
          await client.query(
            `UPDATE public.clodoaldo_prospects
             SET replied = true,
                 reply_text = $1,
                 reply_classification = 'unclassified',
                 reply_at = now(),
                 status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
                 updated_at = now()
             WHERE id = $2`,
            [text, prospect.id]
          );
        } finally {
          client.release();
        }
      } catch (e) {
        console.error("[whatsapp-webhook] Insert error:", e);
      }
    }

    // Send Telegram notification
    const prospectName = prospect?.name || "Número desconhecido";
    const niche = prospect?.niche || "";
    const city = prospect?.city || "";

    const telegramText = [
      `💬 <b>Nova mensagem no WhatsApp!</b>`,
      ``,
      `<b>De:</b> ${escapeHtml(prospectName)}`,
      niche ? `<b>Nicho:</b> ${escapeHtml(niche)}` : "",
      city ? `<b>Cidade:</b> ${escapeHtml(city)}` : "",
      `<b>Telefone:</b> ${from}`,
      prospect ? `<b>Lead ID:</b> <code>${prospect.id}</code>` : "",
      ``,
      `<b>Mensagem:</b>`,
      `<i>${escapeHtml(text.slice(0, 500))}${text.length > 500 ? "…" : ""}</i>`,
      ``,
      prospect ? `🔗 <a href="https://clodoaldo.vercel.app/admin/parceiros">Ver no admin</a>` : "",
    ].filter(Boolean).join("\n");

    try {
      await sendTelegram({
        text: telegramText,
        parseMode: "HTML",
        replyMarkup: prospect ? {
          inline_keyboard: [
            [
              { text: "💬 Responder no WhatsApp", url: `https://wa.me/${from}` },
              { text: "🔗 Ver no admin", url: "https://clodoaldo.vercel.app/admin/parceiros" },
            ],
          ],
        } : undefined,
      });
      console.log("[whatsapp-webhook] Telegram notification sent");
    } catch (e) {
      console.error("[whatsapp-webhook] Telegram error:", e);
    }

    return NextResponse.json({
      ok: true,
      prospect: prospect ? { id: prospect.id, name: prospect.name } : null,
      replyId,
    });
  } catch (e: any) {
    console.error("[whatsapp-webhook] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
