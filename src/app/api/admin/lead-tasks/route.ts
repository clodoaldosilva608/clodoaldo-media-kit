import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET  /api/admin/lead-tasks?lead_id=...        → lista tarefas do lead
 * POST /api/admin/lead-tasks                     → cria tarefa  { lead_id, title, description, due_at, assigned_to }
 * PATCH /api/admin/lead-tasks                    → marca done/undone  { id, done }
 * DELETE /api/admin/lead-tasks?id=...            → remove
 */
export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("lead_id");
  if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
  try {
    const pool = getMeucorrePool();
    const r = await pool.query(
      `SELECT id, lead_id, title, description, due_at, done, done_at, assigned_to, created_at
       FROM lead_tasks WHERE lead_id = $1 ORDER BY (done = true), (due_at IS NULL), due_at ASC, created_at DESC`,
      [leadId]
    );
    return NextResponse.json({ tasks: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, title, description, due_at, assigned_to } = body;
    if (!lead_id || !title) return NextResponse.json({ error: "lead_id and title required" }, { status: 400 });
    const pool = getMeucorrePool();
    const r = await pool.query(
      `INSERT INTO lead_tasks (lead_id, title, description, due_at, assigned_to, created_at)
       VALUES ($1, $2, $3, $4, $5, now()) RETURNING *`,
      [lead_id, title, description || null, due_at || null, assigned_to || null]
    );
    return NextResponse.json({ task: r.rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, done } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const pool = getMeucorrePool();
    const r = await pool.query(
      `UPDATE lead_tasks SET done = $1, done_at = CASE WHEN $1 THEN now() ELSE NULL END
       WHERE id = $2 RETURNING *`,
      [done, id]
    );
    return NextResponse.json({ task: r.rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const pool = getMeucorrePool();
    await pool.query("DELETE FROM lead_tasks WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
