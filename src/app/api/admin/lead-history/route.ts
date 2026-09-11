import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET  /api/admin/lead-history?lead_id=...     → lista histórico do lead
 * POST /api/admin/lead-history                  → adiciona entrada  { lead_id, event_type, notes, from_stage, to_stage, actor, metadata }
 */
export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("lead_id");
  if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
  try {
    const pool = getMeucorrePool();
    const r = await pool.query(
      `SELECT id, lead_id, event_type, from_stage, to_stage, notes, actor, metadata, created_at
       FROM lead_history WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [leadId]
    );
    return NextResponse.json({ history: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, event_type, notes, from_stage, to_stage, actor, metadata } = body;
    if (!lead_id || !event_type) return NextResponse.json({ error: "lead_id and event_type required" }, { status: 400 });
    const pool = getMeucorrePool();
    const r = await pool.query(
      `INSERT INTO lead_history (lead_id, event_type, from_stage, to_stage, notes, actor, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now()) RETURNING *`,
      [lead_id, event_type, from_stage || null, to_stage || null, notes || null, actor || "system", JSON.stringify(metadata || {})]
    );
    return NextResponse.json({ entry: r.rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
