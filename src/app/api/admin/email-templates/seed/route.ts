import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_TEMPLATES } from "@/lib/email-templates";

/**
 * GET  /api/admin/email-templates/seed   → lista templates disponíveis
 * POST /api/admin/email-templates/seed   → insere idempotentemente no Supabase
 */
function getServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  return NextResponse.json({
    templates: DEFAULT_TEMPLATES.map(t => ({ trigger: t.trigger, name: t.name, subject: t.subject })),
  });
}

export async function POST() {
  try {
    const sb: any = getServer();
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const t of DEFAULT_TEMPLATES) {
      // Check if exists
      const { data: existing, error: eErr } = await sb.from("email_templates")
        .select("id").eq("trigger", t.trigger).maybeSingle();
      if (eErr) {
        errors.push(`${t.trigger}: ${eErr.message}`);
        continue;
      }
      if (existing) {
        skipped++;
        continue;
      }
      const { error: insErr } = await sb.from("email_templates").insert({
        name: t.name,
        subject: t.subject,
        preheader: t.preheader,
        body_html: t.body_html,
        trigger: t.trigger,
        active: t.active,
      });
      if (insErr) {
        errors.push(`${t.trigger}: ${insErr.message}`);
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      total: DEFAULT_TEMPLATES.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
