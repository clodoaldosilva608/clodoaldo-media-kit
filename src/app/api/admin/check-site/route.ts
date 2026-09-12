import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/check-site?lead_id=<uuid>
 *
 * Detecta status do site do lead:
 *   - ok: site carrega, HTTPS válido, HTML razoável
 *   - broken: HTTP 4xx/5xx, fetch falhou, ou HTML < 500 chars
 *   - slow: demorou > 8s para carregar
 *   - ssl_invalid: SSL expirado ou inválido
 *   - no_site: lead não tem website cadastrado
 *   - unknown: erro inesperado
 *
 * Atualiza crm_leads.site_status e site_checked_at.
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();

    // 1) Fetch lead para pegar website
    const { data: lead, error: leadErr } = await sb.from("crm_leads")
      .select("id, name, company, source")
      .eq("id", leadId)
      .maybeSingle();
    if (leadErr) throw leadErr;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    // O lead CRM não tem campo "website" direto — vamos tentar buscar no clodoaldo_prospects
    // (tabela do meucorre) caso o lead tenha sido migrado de lá.
    let website: string | null = null;
    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const r = await pool.query(
        "SELECT website FROM clodoaldo_prospects WHERE name ILIKE $1 LIMIT 1",
        [`%${lead.name || lead.company}%`]
      );
      website = r.rows[0]?.website || null;
    } catch {}

    if (!website) {
      // Sem site = ótima oportunidade (roteiro "sem site" do método Gabriel Miranda)
      await sb.from("crm_leads").update({
        site_status: "no_site",
        site_checked_at: new Date().toISOString(),
      }).eq("id", leadId);
      return NextResponse.json({
        site_status: "no_site",
        detail: "Lead não tem website cadastrado — usar roteiro 'sem site' do método Gabriel Miranda.",
        lead_id: leadId,
      });
    }

    // 2) Fazer fetch do site com timeout de 10s
    const startTime = Date.now();
    let site_status = "ok";
    let detail = `Site carregou em `;
    let httpStatus = 0;
    let contentLength = 0;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch(website, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ClodoaldoBot/1.0)" },
      });
      clearTimeout(timeout);
      const elapsed = Date.now() - startTime;
      httpStatus = resp.status;
      detail += `${elapsed}ms (HTTP ${resp.status})`;

      // Verifica SSL
      const url = new URL(resp.url);
      if (url.protocol === "http:") {
        site_status = "ssl_invalid";
        detail += " — site usa HTTP sem SSL (inseguro)";
      }

      // Verifica status HTTP
      if (resp.status >= 400) {
        site_status = "broken";
        detail += ` — HTTP ${resp.status} (site quebrado)`;
      }

      // Verifica tempo de resposta
      if (elapsed > 8000) {
        site_status = "slow";
        detail += ` — demorou ${elapsed}ms (lento)`;
      }

      // Verifica tamanho do HTML
      const text = await resp.text();
      contentLength = text.length;
      if (contentLength < 500) {
        site_status = "broken";
        detail += ` — HTML muito pequeno (${contentLength} chars, provável página de erro)`;
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        site_status = "slow";
        detail = "Timeout — site não respondeu em 10s";
      } else {
        site_status = "broken";
        detail = `Fetch falhou: ${e.message}`;
      }
    }

    // 3) Atualiza lead no CRM
    await sb.from("crm_leads").update({
      site_status,
      site_checked_at: new Date().toISOString(),
    }).eq("id", leadId);

    // 4) Log no history
    await sb.from("crm_lead_events").insert({
      lead_id: leadId,
      event_type: "site_checked",
      description: `Site verificado: ${site_status} — ${detail}`,
    });

    return NextResponse.json({
      site_status,
      detail,
      website,
      http_status: httpStatus,
      content_length: contentLength,
      lead_id: leadId,
      checked_at: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
