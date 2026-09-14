import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/prospects/list
 *
 * Lista todos os prospects do clodoaldo_prospects com campos de tracking
 * de contato (status, send_status, last_contact_at, contacted_count, replied).
 *
 * Usado pela página /admin/fluxo-atendimento pra montar o kanban.
 */
export async function GET() {
  try {
    const pool = getMeucorrePool();
    const r = await pool.query(
      `SELECT
         id, name, niche, city, whatsapp, phone, has_website, rating,
         status, send_status, last_contact_at, contacted_count,
         replied, reply_classification, next_follow_up, message_variant,
         created_at, updated_at,
         website, email, formatted_address, notes,
         instagram, owner_name, owner_email, instagram_handle
       FROM clodoaldo_prospects
       ORDER BY
         CASE WHEN status = 'new' AND send_status = 'pending' THEN 0 ELSE 1 END,
         created_at DESC
       LIMIT 500`
    );
    return NextResponse.json({ prospects: r.rows, total: r.rowCount || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, prospects: [] }, { status: 500 });
  }
}
