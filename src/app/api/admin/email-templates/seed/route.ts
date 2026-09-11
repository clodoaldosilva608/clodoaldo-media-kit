import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { DEFAULT_TEMPLATES } from "@/lib/email-templates";

/**
 * GET  /api/admin/email-templates/seed
 *   Lista os 7 templates que seriam criados.
 *
 * POST /api/admin/email-templates/seed
 *   Insere os 7 templates transacionais padrão se ainda não existirem.
 *   Idempotente: templates existentes (mesmo trigger) não são duplicados.
 */
export async function GET() {
  return NextResponse.json({ templates: DEFAULT_TEMPLATES.map(t => ({ trigger: t.trigger, name: t.name, subject: t.subject })) });
}

export async function POST() {
  try {
    const pool = getMeucorrePool();
    if (!pool) return NextResponse.json({ error: "DB pool indisponível" }, { status: 503 });

    let inserted = 0;
    let skipped = 0;
    for (const t of DEFAULT_TEMPLATES) {
      const exists = await pool.query(
        "SELECT id FROM email_templates WHERE trigger = $1 LIMIT 1",
        [t.trigger]
      );
      if ((exists.rowCount ?? 0) > 0) {
        skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO email_templates (name, subject, preheader, body_html, trigger, active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [t.name, t.subject, t.preheader, t.body_html, t.trigger, t.active]
      );
      inserted++;
    }

    return NextResponse.json({ ok: true, inserted, skipped, total: DEFAULT_TEMPLATES.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
