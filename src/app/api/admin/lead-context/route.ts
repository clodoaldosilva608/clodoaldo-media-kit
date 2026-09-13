import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/lead-context?lead_id=<uuid>
 *
 * Busca contexto adicional do lead (niche, city, hasWebsite, demo_url)
 * cruzando crm_leads (Supabase main) com clodoaldo_prospects (meucorre DB).
 *
 * Retorna:
 *   - lead: dados do crm_leads
 *   - prospect: dados correspondentes do clodoaldo_prospects (busca por name)
 *   - hasWebsite: boolean
 *   - niche, city: do prospect ou fallback
 *   - demoUrl: URL do preview gerado
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();

    // 1) Buscar lead no CRM
    const { data: lead, error: leadErr } = await sb.from("crm_leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();
    if (leadErr) throw leadErr;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    // 2) Buscar correspondente em clodoaldo_prospects por name
    let prospect: any = null;
    let hasWebsite = lead.site_status && lead.site_status !== "no_site" && lead.site_status !== "unknown"
      ? true
      : (lead.site_status === "no_site" ? false : null);

    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const r = await pool.query(
        `SELECT id, name, niche, city, has_website, website, formatted_address, rating,
                phone, whatsapp, instagram, facebook, lat, lng
         FROM clodoaldo_prospects
         WHERE name ILIKE $1 OR name ILIKE $2
         ORDER BY created_at DESC LIMIT 1`,
        [`%${lead.name}%`, `%${lead.name.split(" ")[0]}%`]
      );
      if (r.rows.length > 0) {
        prospect = r.rows[0];
        hasWebsite = prospect.has_website;
      }
    } catch (e: any) {
      // meucorre indisponível — usa site_status do crm_leads como fallback
    }

    // 3) Constrói contexto final
    const niche = prospect?.niche || lead.intent || "negócio local";
    const city = prospect?.city || "Recife, PE";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clodoaldo.vercel.app";
    const demoUrl = lead.demo_url || `${siteUrl}/api/preview?lead=${lead.id}&style=dark`;

    return NextResponse.json({
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        company: lead.company,
        intent: lead.intent,
        site_status: lead.site_status,
        demo_url: lead.demo_url,
        demo_generated_at: lead.demo_generated_at,
      },
      prospect: prospect ? {
        id: prospect.id,
        name: prospect.name,
        niche: prospect.niche,
        city: prospect.city,
        has_website: prospect.has_website,
        website: prospect.website,
        formatted_address: prospect.formatted_address,
        rating: prospect.rating,
        phone: prospect.phone,
        whatsapp: prospect.whatsapp,
        instagram: prospect.instagram,
        facebook: prospect.facebook,
      } : null,
      // Convenience fields
      hasWebsite,
      niche,
      city,
      demoUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
