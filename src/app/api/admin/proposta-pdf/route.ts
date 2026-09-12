import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/proposta-pdf
 *
 * Gera HTML de proposta comercial (pode ser impresso como PDF via browser).
 * Retorna HTML completo com:
 * - Logo do Clodoaldo
 * - Nome do lead + data
 * - Demo URL (QR code)
 * - Lista de produtos recomendados + preços
 * - Condições (12x, sem fidelidade)
 * - Validade (7 dias)
 *
 * Body: { lead_id, product_skus?: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, product_skus } = body;
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();

    // Busca lead
    const { data: lead, error: leadErr } = await sb.from("crm_leads")
      .select("*").eq("id", lead_id).maybeSingle();
    if (leadErr) throw leadErr;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    // Busca produtos (todos ativos ou filtrados por SKUs)
    let productsQuery = sb.from("products_catalog")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (product_skus && Array.isArray(product_skus) && product_skus.length > 0) {
      productsQuery = productsQuery.in("whatsapp_sku", product_skus);
    }
    const { data: products } = await productsQuery;

    const today = new Date().toLocaleDateString("pt-BR");
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR");
    const demoUrl = lead.demo_url || `https://clodoaldo-media-kit.vercel.app/api/preview?lead=${lead.id}&style=dark`;

    const totalCents = (products || []).reduce((sum: number, p: any) => sum + (p.price_cents || 0), 0);
    const totalFormatted = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const installment = (totalCents / 12 / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const productRows = (products || []).map((p: any, i: number) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <div style="font-weight:bold;color:#0a0a0a;">${p.icon || "✅"} ${p.name}</div>
          <div style="font-size:11px;color:#666;margin-top:2px;">${p.description || ""}</div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;color:#10b981;font-weight:bold;">
          ${p.price_label || (p.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proposta — ${lead.name} — ${today}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
  .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #10b981, #0ea5e9); color: #fff; padding: 32px; }
  .header h1 { font-size: 24px; font-weight: 800; }
  .header .subtitle { font-size: 14px; opacity: 0.9; margin-top: 4px; }
  .header .date { font-size: 12px; opacity: 0.7; margin-top: 8px; }
  .body { padding: 32px; }
  .lead-info { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
  .lead-info h2 { font-size: 18px; color: #0a0a0a; }
  .lead-info p { font-size: 13px; color: #666; margin-top: 4px; }
  .demo-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }
  .demo-box a { color: #10b981; font-weight: bold; text-decoration: none; word-break: break-all; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 12px; border-bottom: 2px solid #10b981; font-size: 12px; text-transform: uppercase; color: #666; }
  .total-row { background: #f0fdf4; }
  .total-row td { font-weight: 800; font-size: 16px; color: #10b981; border-bottom: none; }
  .conditions { margin-bottom: 24px; }
  .conditions h3 { font-size: 14px; color: #0a0a0a; margin-bottom: 8px; }
  .conditions ul { list-style: none; }
  .conditions li { font-size: 13px; color: #666; padding: 4px 0; }
  .conditions li::before { content: "✓ "; color: #10b981; font-weight: bold; }
  .validity { text-align: center; font-size: 12px; color: #999; padding: 16px; border-top: 1px solid #eee; }
  .cta { text-align: center; margin-top: 24px; }
  .cta a { display: inline-block; background: #10b981; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; }
  .footer { text-align: center; padding: 20px; font-size: 11px; color: #999; }
  @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; } }
</style></head><body>
<div class="container">
  <div class="header">
    <h1>📋 Proposta Comercial</h1>
    <div class="subtitle">Clodoaldo Silva — Criador e Desenvolvedor Digital</div>
    <div class="date">Emitida em ${today} • Válida até ${validUntil}</div>
  </div>
  <div class="body">
    <div class="lead-info">
      <h2>${lead.name}</h2>
      <p>${lead.company || lead.name} • ${lead.whatsapp || "—"}</p>
      <p>${lead.project_idea || lead.notes || "Proposta personalizada para seu negócio"}</p>
    </div>

    <div class="demo-box">
      🎨 <strong>Site demo já pronto pra você ver:</strong><br>
      <a href="${demoUrl}" target="_blank">${demoUrl}</a>
    </div>

    <table>
      <thead>
        <tr><th>Produto / Serviço</th><th style="text-align:right;">Investimento</th></tr>
      </thead>
      <tbody>
        ${productRows}
        <tr class="total-row">
          <td style="padding:16px 12px;font-size:16px;">Total</td>
          <td style="padding:16px 12px;text-align:right;font-size:18px;">${totalFormatted}</td>
        </tr>
      </tbody>
    </table>

    <div class="conditions">
      <h3>Condições comerciais</h3>
      <ul>
        <li>Parcelamento em até 12x de ${installment}</li>
        <li>Pagamento via PIX com 5% de desconto à vista</li>
        <li>Sem fidelidade — cancele a recorrência quando quiser</li>
        <li>Sem trabalho pra você — eu cuido de tudo (design, conteúdo, publicação)</li>
        <li>Suporte por WhatsApp durante todo o período</li>
        <li>Site é seu para sempre — entregue com domínio e hospedagem</li>
      </ul>
    </div>

    <div class="cta">
      <a href="https://wa.me/5581920051068?text=${encodeURIComponent(`Olá Clodoaldo! Aceito a proposta de ${totalFormatted} para ${lead.name}. Como prosseguimos?`)}" target="_blank">
        💬 Aceitar proposta no WhatsApp
      </a>
    </div>
  </div>
  <div class="validity">
    Esta proposta é válida até <strong>${validUntil}</strong>.<br>
    Após esta data, valores podem sofrer reajuste.
  </div>
  <div class="footer">
    Clodoaldo Silva — Criador e Desenvolvedor Digital<br>
    📱 (81) 92005-1068 • 🌐 clodoaldo-media-kit.vercel.app
  </div>
</div>
</body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
