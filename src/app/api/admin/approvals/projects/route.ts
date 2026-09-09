import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { generateToken, buildPublicUrl } from "@/lib/approvals";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Number(searchParams.get("limit") || 100);

    let query = supabase
      .from("approval_projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    // Busca configurações padrão
    const { data: settings } = await supabase
      .from("approval_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    const token = generateToken(32);

    const payload = {
      client_token: token,
      client_name: body.client_name,
      client_email: body.client_email || null,
      client_whatsapp: body.client_whatsapp || null,
      project_title: body.project_title,
      project_type: body.project_type || "website",
      preview_url: body.preview_url || null,
      preview_html: body.preview_html || null,
      notes_for_client: body.notes_for_client || null,
      project_scope: body.project_scope || null,
      out_of_scope_examples: body.out_of_scope_examples || null,
      status: "draft",
      max_revisions: body.max_revisions ?? settings?.default_max_revisions ?? 3,
      current_revision: 0,
      theme: body.theme || "inherit",
      expires_at: body.expires_at || null,
      access_password: body.access_password || null,
      prospect_id: body.prospect_id || null,
    };

    const { data, error } = await supabase
      .from("approval_projects")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, public_url: buildPublicUrl(token) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
