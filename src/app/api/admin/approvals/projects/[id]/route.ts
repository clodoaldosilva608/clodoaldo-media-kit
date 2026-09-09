import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPublicUrl } from "@/lib/approvals";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;

    const { data: project, error } = await supabase
      .from("approval_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    const { data: revisions } = await supabase
      .from("approval_revisions")
      .select("*")
      .eq("project_id", id)
      .order("revision_number", { ascending: true });

    const { data: change_requests } = await supabase
      .from("approval_change_requests")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    const { data: image_comments } = await supabase
      .from("approval_image_comments")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    const { data: access_logs } = await supabase
      .from("approval_access_logs")
      .select("*")
      .eq("project_id", id)
      .order("accessed_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      data: {
        ...project,
        revisions: revisions || [],
        change_requests: change_requests || [],
        image_comments: image_comments || [],
        access_logs: access_logs || [],
        public_url: buildPublicUrl(project.client_token),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;
    const body = await req.json();

    const allowed = [
      "client_name",
      "client_email",
      "client_whatsapp",
      "project_title",
      "project_type",
      "preview_url",
      "preview_html",
      "notes_for_client",
      "project_scope",
      "out_of_scope_examples",
      "status",
      "max_revisions",
      "theme",
      "expires_at",
      "access_password",
      "prospect_id",
      "approved_at",
      "sent_at",
    ];

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("approval_projects")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;

    const { error } = await supabase
      .from("approval_projects")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
