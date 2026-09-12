import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * POST /api/admin/prospects/mark-sent
 *   body: { prospect_id, message_variant, message_text }
 *
 * Marca um prospect como "já contactado" no banco clodoaldo_prospects:
 *   - status: 'new' → 'contacted'
 *   - send_status: 'pending' → 'sent'
 *   - last_contact_at = now()
 *   - contacted_count += 1
 *   - send_at = now()
 *   - message_variant = string (qual variante usou: A, B, C, L, followup-A, etc.)
 *
 * Também insere registro em clodoaldo_envios (tabela de auditoria).
 *
 * Isso garante que o lead NÃO seja contactado novamente pelo cron automático
 * e não apareça na lista "próximo a contactar".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospect_id, message_variant, message_text } = body;

    if (!prospect_id) {
      return NextResponse.json({ error: "prospect_id required" }, { status: 400 });
    }

    const pool = getMeucorrePool();

    // 1. Atualizar clodoaldo_prospects
    const result = await pool.query(
      `UPDATE clodoaldo_prospects
       SET
         status = 'contacted',
         send_status = 'sent',
         last_contact_at = now(),
         send_at = now(),
         contacted_count = COALESCE(contacted_count, 0) + 1,
         message_variant = $2,
         updated_at = now()
       WHERE id = $1
       RETURNING id, name, status, send_status, contacted_count, last_contact_at`,
      [prospect_id, message_variant || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "prospect not found" }, { status: 404 });
    }

    const updated = result.rows[0];

    // 2. Inserir em clodoaldo_envios (auditoria)
    try {
      await pool.query(
        `INSERT INTO clodoaldo_envios
          (prospect_id, sent_at, message_text, message_variant, status, campaign)
         VALUES ($1, now(), $2, $3, 'sent', 'manual')`,
        [prospect_id, message_text || null, message_variant || null]
      );
    } catch (e: any) {
      // Não falha se clodoaldo_envios não existir
      console.warn("[mark-sent] clodoaldo_envios insert error:", e.message);
    }

    return NextResponse.json({
      ok: true,
      prospect: updated,
      message: `Lead marcado como contactado (tentativa #${updated.contacted_count})`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
