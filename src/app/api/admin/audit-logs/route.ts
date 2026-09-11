import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/audit-logs
 *   ?actor=&action=&entity=&entity_id=&from=&to=&limit=
 *
 * Retorna logs de auditoria filtráveis (auditoria P1-7).
 *
 * POST /api/admin/audit-logs
 *   { actor, actor_role, action, entity, entity_id, details }
 *   Cria entrada de log (usado por outras partes do sistema).
 */

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const where: string[] = [];
    const args: any[] = [];
    let i = 1;
    if (params.get("actor")) { where.push(`actor = $${i++}`); args.push(params.get("actor")); }
    if (params.get("action")) { where.push(`action = $${i++}`); args.push(params.get("action")); }
    if (params.get("entity")) { where.push(`entity = $${i++}`); args.push(params.get("entity")); }
    if (params.get("entity_id")) { where.push(`entity_id = $${i++}`); args.push(params.get("entity_id")); }
    if (params.get("from")) { where.push(`created_at >= $${i++}`); args.push(params.get("from")); }
    if (params.get("to")) { where.push(`created_at <= $${i++}`); args.push(params.get("to")); }
    const limit = Math.min(Number(params.get("limit") || 200), 1000);

    const sql = `SELECT id, actor, actor_role, action, entity, entity_id, details, ip, user_agent, created_at
                 FROM audit_logs ${where.length ? "WHERE " + where.join(" AND ") : ""}
                 ORDER BY created_at DESC LIMIT ${limit}`;

    const pool = getMeucorrePool();
    const r = await pool.query(sql, args);

    // Lista de valores distintos para os filtros
    const filters = await pool.query(`
      SELECT
        COALESCE(array_agg(DISTINCT actor) FILTER (WHERE actor IS NOT NULL), '{}') AS actors,
        COALESCE(array_agg(DISTINCT action) FILTER (WHERE action IS NOT NULL), '{}') AS actions,
        COALESCE(array_agg(DISTINCT entity) FILTER (WHERE entity IS NOT NULL), '{}') AS entities
      FROM audit_logs
    `);

    return NextResponse.json({
      logs: r.rows,
      total: r.rowCount,
      filters: filters.rows[0],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, actor_role, action, entity, entity_id, details, ip, user_agent } = body;
    if (!actor || !action) return NextResponse.json({ error: "actor and action required" }, { status: 400 });
    const pool = getMeucorrePool();
    const r = await pool.query(
      `INSERT INTO audit_logs (actor, actor_role, action, entity, entity_id, details, ip, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now()) RETURNING *`,
      [actor, actor_role || null, action, entity || null, entity_id || null, JSON.stringify(details || {}), ip || null, user_agent || null]
    );
    return NextResponse.json({ log: r.rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
