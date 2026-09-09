import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/** Cliente pede alteração. Verifica limite de revisões. */
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
      .select("*")
      .eq("client_token", token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    // Verifica senha
    if (project.access_password && body.password !== project.access_password) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Verifica status
    if (["approved", "archived", "expired"].includes(project.status)) {
      return NextResponse.json({ error: "Projeto já finalizado — não aceita mais alterações" }, { status: 400 });
    }

    // Verifica se há limite restante
    const remaining = project.max_revisions - project.current_revision;
    if (remaining <= 0 && !body.force_with_cost) {
      // Busca mensagem de limite nas settings
      const { data: settings } = await supabase
        .from("approval_settings")
        .select("limit_reached_message")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      return NextResponse.json({
        error: "limit_reached",
        message: settings?.limit_reached_message || "Você atingiu o limite de revisões gratuitas. Próximas revisões podem ter custos adicionais.",
        can_force_with_cost: true,
      }, { status: 402 });
    }

    // Cria pedido de alteração
    const payload: Record<string, unknown> = {
      project_id: project.id,
      revision_id: body.revision_id || null,
      client_message: body.message,
      category: body.category || "other",
      // Se estourou limite e cliente forçou, marcamos como "fora do escopo" (com custo potencial)
      is_fine_tune: false,
      counts_as_revision: body.force_with_cost ? true : false,
      has_extra_cost: body.force_with_cost ? true : false,
      status: "pending",
      // Comentário por área
      image_index: body.image_index ?? null,
      image_x: body.image_x ?? null,
      image_y: body.image_y ?? null,
    };

    const { data: cr, error: crErr } = await supabase
      .from("approval_change_requests")
      .insert(payload)
      .select()
      .single();

    if (crErr) return NextResponse.json({ error: crErr.message }, { status: 500 });

    // Atualiza status do projeto para "changes_requested"
    await supabase
      .from("approval_projects")
      .update({ status: "changes_requested" })
      .eq("id", project.id);

    // Notifica admin (best effort)
    const { data: settings } = await supabase
      .from("approval_settings")
      .select("web3forms_access_key,notification_email")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    if (settings?.web3forms_access_key && settings?.notification_email) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: settings.web3forms_access_key,
            subject: `🛠️ Nova alteração solicitada: ${project.project_title}`,
            from_name: "Portal de Aprovação",
            to: settings.notification_email,
            name: project.client_name,
            message: `Cliente: ${project.client_name}
Projeto: ${project.project_title}

Mensagem do cliente:
${body.message}

${body.force_with_cost ? "⚠️ Cliente está ciente de que pode ter custo adicional (limite estourado)." : ""}

Acesse o painel admin para responder.`,
          }),
        });
      } catch {}
    }

    return NextResponse.json({ data: cr });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
