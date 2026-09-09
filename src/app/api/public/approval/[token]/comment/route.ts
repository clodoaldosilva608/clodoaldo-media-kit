import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/** Cliente ou admin adiciona comentário em ponto específico de uma imagem */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { token } = await params;
    const body = await req.json();

    const { data: project, error } = await supabase
      .from("approval_projects")
      .select("id, access_password, status")
      .eq("client_token", token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    if (project.access_password && body.password !== project.access_password) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    if (["approved", "archived", "expired"].includes(project.status)) {
      return NextResponse.json({ error: "Projeto finalizado" }, { status: 400 });
    }

    if (!body.revision_id || body.image_index === undefined || body.x === undefined || body.y === undefined || !body.comment) {
      return NextResponse.json({ error: "Campos obrigatórios: revision_id, image_index, x, y, comment" }, { status: 400 });
    }

    const { data, error: cErr } = await supabase
      .from("approval_image_comments")
      .insert({
        project_id: project.id,
        revision_id: body.revision_id,
        image_index: body.image_index,
        x_percent: body.x,
        y_percent: body.y,
        author_name: body.author_name || project.id.slice(0, 8),
        author_role: "client",
        comment: body.comment,
      })
      .select()
      .single();

    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
