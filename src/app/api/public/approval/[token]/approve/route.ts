import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notifyProjectApproved } from "@/lib/telegram";

/** Cliente aprova o projeto (somente se não aprovado/arquivado/expirado) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { token } = await params;
    const body = await req.json().catch(() => ({}));

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
      return NextResponse.json({ error: "Projeto não pode mais ser aprovado (já finalizado ou expirado)" }, { status: 400 });
    }

    // Atualiza projeto
    const now = new Date().toISOString();
    const { data: updated, error: uErr } = await supabase
      .from("approval_projects")
      .update({
        status: "approved",
        approved_at: now,
      })
      .eq("id", project.id)
      .select()
      .single();

    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

    // Marca última revisão como approved
    if (project.current_revision) {
      await supabase
        .from("approval_revisions")
        .update({ status: "approved", approved_at: now })
        .eq("project_id", project.id)
        .eq("revision_number", project.current_revision);
    }

    // Notifica admin via email (best effort)
    const { data: settings } = await supabase
      .from("approval_settings")
      .select("web3forms_access_key,notification_email,brand_name")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    if (settings?.web3forms_access_key && settings?.notification_email) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: settings.web3forms_access_key,
            subject: `✅ Projeto aprovado: ${project.project_title}`,
            from_name: "Portal de Aprovação",
            to: settings.notification_email,
            name: project.client_name,
            message: `O cliente ${project.client_name} aprovou o projeto "${project.project_title}" em ${now}.

Comentário: ${body.comment || "(sem comentário)"}

Próximo passo: entrar em contato para finalizar entrega.`,
          }),
        });
      } catch {}
    }

    // Notifica Telegram (best effort) — se configurado
    try {
      await notifyProjectApproved({
        clientName: project.client_name,
        projectTitle: project.project_title,
        approvedAt: now,
        adminUrl: `https://clodoaldo-media-kit.vercel.app/admin/aprovacoes`,
      });
    } catch {}

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
