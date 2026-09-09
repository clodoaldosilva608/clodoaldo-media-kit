import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/** Retorna o projeto público (com revisões, change requests visíveis, services visíveis) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { token } = await params;

    const { data: project, error } = await supabase
      .from("approval_projects")
      .select("*")
      .eq("client_token", token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    // Verifica senha se houver
    const password = req.nextUrl.searchParams.get("p");
    if (project.access_password) {
      if (password !== project.access_password) {
        return NextResponse.json({ error: "Senha necessária", requires_password: true }, { status: 401 });
      }
    }

    // Verifica expiração
    if (project.expires_at && new Date(project.expires_at) < new Date()) {
      // Marca como expirado
      await supabase.from("approval_projects").update({ status: "expired" }).eq("id", project.id);
      project.status = "expired";
    }

    // Busca revisões
    const { data: revisions } = await supabase
      .from("approval_revisions")
      .select("*")
      .eq("project_id", project.id)
      .order("revision_number", { ascending: true });

    // Busca change requests do cliente
    const { data: change_requests } = await supabase
      .from("approval_change_requests")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    // Busca image comments
    const { data: image_comments } = await supabase
      .from("approval_image_comments")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    // Busca additional services visíveis
    const { data: services } = await supabase
      .from("additional_services")
      .select("*")
      .eq("visible_to_client", true)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    // Busca settings (sem campos sensíveis)
    const { data: settings } = await supabase
      .from("approval_settings")
      .select("brand_name,brand_logo_url,default_theme,limit_reached_message,out_of_scope_message,pix_key,pix_key_type,pix_recipient_name,whatsapp_for_receipts")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    // Log de acesso
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : null;
    const ua = req.headers.get("user-agent");
    const referer = req.headers.get("referer");
    await supabase.from("approval_access_logs").insert({
      project_id: project.id,
      ip_address: ip,
      user_agent: ua,
      referer,
      accessed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      data: {
        project: {
          ...project,
          access_password: undefined, // não expõe senha
        },
        revisions: revisions || [],
        change_requests: change_requests || [],
        image_comments: image_comments || [],
        services: services || [],
        settings: settings || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
