import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/roles
 *   Lista usuários com suas roles.
 * POST /api/admin/roles
 *   body: { user_id, email, role }
 *   Atribui/atualiza role de um usuário.
 * PATCH /api/admin/roles
 *   body: { user_id, role }
 *   Atualiza role.
 * DELETE /api/admin/roles?user_id=...
 *   Remove role (volta para 'leitura' por padrão).
 *
 * Roles aceitos: admin | comercial | marketing | financeiro | conteudo | leitura
 * Tabela: user_roles (user_id, role, email)
 */

const VALID_ROLES = ["admin", "comercial", "marketing", "financeiro", "conteudo", "leitura"];

export async function GET() {
  try {
    const pool = getMeucorrePool();
    const r = await pool.query(
      "SELECT user_id, email, role, created_at, updated_at FROM user_roles ORDER BY role, email LIMIT 100"
    );
    return NextResponse.json({ users: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, email, role } = body;
    if (!user_id || !email) return NextResponse.json({ error: "user_id and email required" }, { status: 400 });
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });

    const pool = getMeucorrePool();
    await pool.query(
      `INSERT INTO user_roles (user_id, email, role, created_at, updated_at)
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET role = $3, email = $2, updated_at = now()`,
      [user_id, email, role]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (actor, actor_role, action, entity, entity_id, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      ["system", "admin", "role_change", "user_roles", user_id, JSON.stringify({ email, role })]
    );

    return NextResponse.json({ ok: true, user_id, email, role });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, role } = body;
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });

    const pool = getMeucorrePool();
    await pool.query(
      "UPDATE user_roles SET role = $1, updated_at = now() WHERE user_id = $2",
      [role, user_id]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });
  try {
    const pool = getMeucorrePool();
    await pool.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
