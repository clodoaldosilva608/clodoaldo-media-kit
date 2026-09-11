import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const VALID_ROLES = ["admin", "comercial", "marketing", "financeiro", "conteudo", "leitura"];

function getServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  try {
    const sb: any = getServer();
    const { data, error } = await sb.from("user_roles")
      .select("user_id, email, role, created_at, updated_at")
      .order("role").order("email").limit(100);
    if (error) throw error;
    return NextResponse.json({ users: data || [] });
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

    const sb: any = getServer();
    // Try update first, fallback to insert
    const { data: upd, error: updErr } = await sb.from("user_roles")
      .update({ role, email, updated_at: new Date().toISOString() })
      .eq("user_id", user_id)
      .select();
    if (updErr) throw updErr;

    let finalRow = upd?.[0];
    if (!finalRow) {
      const { data: ins, error: insErr } = await sb.from("user_roles").insert({
        user_id, email, role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();
      if (insErr) throw insErr;
      finalRow = ins;
    }

    // Audit log
    await sb.from("audit_logs").insert({
      actor: "system",
      actor_role: "admin",
      action: "role_change",
      entity: "user_roles",
      entity_id: user_id,
      details: { email, role },
    });

    return NextResponse.json({ ok: true, user_id, email, role, row: finalRow });
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

    const sb: any = getServer();
    const { error } = await sb.from("user_roles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    const sb: any = getServer();
    const { error } = await sb.from("user_roles").delete().eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
