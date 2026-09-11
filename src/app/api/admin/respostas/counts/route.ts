import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/respostas/counts
 *
 * Returns a map of prospect_id → reply count.
 * Used by the leads list to show "N respostas" badges without fetching all replies.
 *
 * Response: { counts: { "uuid-1": 2, "uuid-2": 1, ... } }
 */
export async function GET() {
  try {
    const client = await getMeucorrePool().connect();
    try {
      const result = await client.query(
        `SELECT
            prospect_id::text as id,
            count(*)::int as c
         FROM public.clodoaldo_respostas
         WHERE prospect_id IS NOT NULL
         GROUP BY prospect_id`
      );
      const counts: Record<string, number> = {};
      for (const row of result.rows) {
        if (row.id) counts[row.id] = row.c;
      }
      return NextResponse.json({ counts, error: null });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ counts: {}, error: e.message });
  }
}
