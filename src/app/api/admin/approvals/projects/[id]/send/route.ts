import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPublicUrl } from "@/lib/approvals";

/** Envia o projeto ao cliente: cria revisão #1, status=sent, envia email de notificação */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const { data: project, error: pErr } = await supabase
      .from("approval_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    // Cria revisão #1 (ou nova revisão se já enviado)
    const nextRevisionNumber = (project.current_revision || 0) + 1;

    const { data: revision, error: rErr } = await supabase
      .from("approval_revisions")
      .insert({
        project_id: id,
        revision_number: nextRevisionNumber,
        preview_url: body.preview_url || project.preview_url,
        preview_html: body.preview_html || project.preview_html,
        notes: body.notes || null,
        images: body.images || null,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

    // Atualiza projeto
    const { error: uErr } = await supabase
      .from("approval_projects")
      .update({
        status: "sent",
        current_revision: nextRevisionNumber,
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

    // Dispara email de notificação (via Web3Forms) — best effort
    const settings = await supabase
      .from("approval_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    if (settings.data?.web3forms_access_key && project.client_email) {
      try {
        const publicUrl = buildPublicUrl(project.client_token);
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: settings.data.web3forms_access_key,
            subject: `${project.project_title} — Projeto pronto para aprovação`,
            from_name: settings.data.brand_name || "Clodoaldo Silva",
            to: project.client_email,
            name: project.client_name,
            replyto: settings.data.notification_email || "clodoaldosilva608@gmail.com",
            message: `Olá ${project.client_name},

Seu projeto "${project.project_title}" está pronto para revisão.

Acesse o portal de aprovação:
${publicUrl}

${project.notes_for_client || ""}

Qualquer dúvida, é só responder este email.

Atenciosamente,
${settings.data.brand_name || "Clodoaldo Silva"}`,
          }),
        });
      } catch (e) {
        // best effort, não falha o envio
      }
    }

    return NextResponse.json({ data: { project_id: id, revision, public_url: buildPublicUrl(project.client_token) } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
