import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * POST /api/admin/prospects/update-status
 *
 * Atualiza status e/ou notes de um prospect no meucorre.
 * Usado pelo botão "Descartar lead" no Fluxo de Atendimento.
 *
 * Body: {
 *   prospect_id: string,
 *   status?: string,           // ex: "perdido", "fechado", "new", "contacted"
 *   notes_append?: string,     // texto pra adicionar ao final das notes existentes
 *   notes_set?: string,        // substitui completamente as notes
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospect_id, status, notes_append, notes_set } = body;

    if (!prospect_id) {
      return NextResponse.json({ error: "prospect_id required" }, { status: 400 });
    }

    const pool = getMeucorrePool();

    // Buscar notes atuais se for append
    let finalNotes: string | undefined;
    if (notes_set !== undefined) {
      finalNotes = notes_set;
    } else if (notes_append !== undefined) {
      const { rows } = await pool.query(
        "SELECT notes FROM clodoaldo_prospects WHERE id = $1",
        [prospect_id]
      );
      const existing = (rows[0]?.notes as string) || "";
      finalNotes = (existing + (existing ? "\n" : "") + notes_append).trim();
    }

    // Construir query dinâmica
    const updates: string[] = ["updated_at = now()"];
    const values: any[] = [];
    let paramIdx = 1;

    if (status) {
      updates.push(`status = $${paramIdx++}`);
      values.push(status);
      // Se mudou pra 'perdido' ou 'fechado', marcar como replied (pra sair do kanban contacted)
      if (status === "perdido" || status === "fechado") {
        updates.push(`reply_classification = $${paramIdx++}`);
        values.push(status === "perdido" ? "opt_out" : "meeting_ready");
      }
    }

    if (finalNotes !== undefined) {
      updates.push(`notes = $${paramIdx++}`);
      values.push(finalNotes);
    }

    values.push(prospect_id);
    const query = `
      UPDATE clodoaldo_prospects
      SET ${updates.join(", ")}
      WHERE id = $${paramIdx}
      RETURNING id, status, notes, updated_at
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Prospect não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      prospect: rows[0],
    });
  } catch (e: any) {
    console.error("[update-status] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
