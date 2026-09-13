import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/proposta-pdf
 *
 * Gera HTML de proposta comercial persuasiva — trabalha o inconsciente:
 * - Loss aversion (o que perde por não ter)
 * - Social proof (números, prova social)
 * - Anchoring (compara com aluguel, funcionário)
 * - Reciprocity (demo grátis já entregue)
 * - Scarcity (validade 7 dias)
 * - Authority (credenciais, portfólio)
 *
 * Body: { lead_id, product_skus?: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, product_skus } = body;
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();

    const { data: lead, error: leadErr } = await sb.from("crm_leads")
      .select("*").eq("id", lead_id).maybeSingle();
    if (leadErr) throw leadErr;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    let productsQuery = sb.from("products_catalog")
      .select("*").eq("is_active", true).order("sort_order", { ascending: true });
    if (product_skus && Array.isArray(product_skus) && product_skus.length > 0) {
      productsQuery = productsQuery.in("whatsapp_sku", product_skus);
    }
    const { data: products } = await productsQuery;

    const today = new Date().toLocaleDateString("pt-BR");
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR");
    const demoUrl = lead.demo_url || `https://clodoaldo.vercel.app/api/preview?lead=${lead.id}&style=dark`;

    const totalCents = (products || []).reduce((sum: number, p: any) => sum + (p.price_cents || 0), 0);
    const totalFormatted = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const installment = (totalCents / 12 / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const monthlyEquivalent = (totalCents / 12 / 100 * 0.3).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const productRows = (products || []).map((p: any, i: number) => `
      <tr>
        <td style="padding:14px;border-bottom:1px solid #eee;">
          <div style="font-weight:bold;color:#0a0a0a;font-size:14px;">${p.icon || "✅"} ${p.name}</div>
          <div style="font-size:11px;color:#888;margin-top:3px;">${p.description || ""}</div>
        </td>
        <td style="padding:14px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;color:#10b981;font-weight:bold;font-size:13px;">
          ${p.price_label || (p.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
      </tr>
    `).join("");

    // Determinar nicho para personalizar a proposta
    const nicheText = lead.notes?.match(/Nicho: ([^,]+)/)?.[1] || lead.intent || "seu negócio";
    const hasSite = lead.site_status === "ok" || lead.notes?.includes("Tem site: Sim");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proposta — ${lead.name} — ${today}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
  .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0a0a0f, #1a1a2e); color: #fff; padding: 32px; text-align: center; }
  .header h1 { font-size: 22px; font-weight: 800; }
  .header .subtitle { font-size: 13px; opacity: 0.7; margin-top: 4px; }
  .header .date { font-size: 11px; opacity: 0.5; margin-top: 8px; }
  .body { padding: 32px; }
  .section-title { font-size: 16px; font-weight: 800; color: #0a0a0a; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #10b981; }
  .lead-info { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center; }
  .lead-info h2 { font-size: 18px; color: #0a0a0a; }
  .lead-info p { font-size: 12px; color: #888; margin-top: 4px; }
  .demo-box { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; }
  .demo-box a { color: #10b981; font-weight: bold; text-decoration: none; word-break: break-all; font-size: 12px; }
  .pain-box { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .pain-box h3 { font-size: 14px; color: #991b1b; margin-bottom: 10px; }
  .pain-box p { font-size: 13px; color: #7f1d1d; line-height: 1.6; margin-bottom: 8px; }
  .gain-box { background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .gain-box h3 { font-size: 14px; color: #065f46; margin-bottom: 10px; }
  .gain-box p { font-size: 13px; color: #064e3b; line-height: 1.6; margin-bottom: 8px; }
  .anchor-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }
  .anchor-box .big { font-size: 28px; font-weight: 900; color: #0a0a0a; }
  .anchor-box .small { font-size: 12px; color: #92400e; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 12px; border-bottom: 2px solid #10b981; font-size: 11px; text-transform: uppercase; color: #666; }
  .total-row { background: #f0fdf4; }
  .total-row td { font-weight: 800; font-size: 16px; color: #10b981; border-bottom: none; }
  .conditions { margin-bottom: 24px; }
  .conditions h3 { font-size: 14px; color: #0a0a0a; margin-bottom: 8px; }
  .conditions ul { list-style: none; }
  .conditions li { font-size: 13px; color: #555; padding: 5px 0; }
  .conditions li::before { content: "✓ "; color: #10b981; font-weight: bold; }
  .urgency { background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }
  .urgency h3 { font-size: 15px; color: #991b1b; }
  .urgency p { font-size: 12px; color: #7f1d1d; margin-top: 4px; }
  .cta { text-align: center; margin-top: 24px; }
  .cta a { display: inline-block; background: #10b981; color: #fff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
  .validity { text-align: center; font-size: 11px; color: #999; padding: 16px; border-top: 1px solid #eee; }
  .footer { text-align: center; padding: 20px; font-size: 11px; color: #999; }
  .social-proof { display: flex; justify-content: space-around; margin-bottom: 24px; }
  .social-proof .stat { text-align: center; }
  .social-proof .num { font-size: 24px; font-weight: 900; color: #10b981; }
  .social-proof .label { font-size: 10px; color: #888; }
  @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; } }
</style></head><body>
<div class="container">
  <div class="header">
    <h1>📋 Proposta de Parceria Comercial</h1>
    <div class="subtitle">Clodoaldo Silva — Criador e Desenvolvedor Digital</div>
    <div class="date">Emitida em ${today} • Válida até ${validUntil}</div>
  </div>
  <div class="body">

    <div class="lead-info">
      <h2>${lead.name}</h2>
      <p>${lead.whatsapp || "—"} • ${nicheText}</p>
    </div>

    <!-- RECIPROCITY: demo já entregue -->
    <div class="demo-box">
      🎨 <strong>Já criei seu site demo — está pronto pra ver agora:</strong><br><br>
      <a href="${demoUrl}" target="_blank">${demoUrl}</a><br><br>
      <span style="font-size:11px;color:#666;">Este preview foi criado gratuitamente, exclusivamente para ${lead.name}. É só clicar pra ver como ficaria.</span>
    </div>

    <!-- LOSS AVERSION: o que está perdendo -->
    <div class="pain-box">
      <h3>⚠️ O que você está perdendo TODO MÊS sem um site profissional</h3>
      <p><strong>1. Clientes indo pro concorrente:</strong> 150-400 pessoas pesquisam "${nicheText}" na sua região todo mês no Google. Sem site, <strong>todas vão pro concorrente que aparece primeiro</strong>.</p>
      <p><strong>2. Invisibilidade digital:</strong> 87% dos consumidores pesquisam online antes de decidir onde comprar. Se não te encontram, <strong>você não existe</strong> pra esses 87%.</p>
      <p><strong>3. Custo invisível:</strong> A cada mês sem site = 30-50 clientes novos que NÃO vieram. Em 6 meses, são <strong>200+ clientes perdidos</strong>. Em 1 ano, 400+. Cada cliente que não veio é dinheiro que foi direto pro bolso do concorrente.</p>
      <p><strong>4. Dependência de indicação:</strong> Se para de chover indicação, para de chover cliente. Sem site, você é refém do boca-a-boca — que não é escalável nem previsível.</p>
    </div>

    <!-- GAIN: o que ganha -->
    <div class="gain-box">
      <h3>✅ O que muda com o site profissional</h3>
      <p><strong>1. Aparece no Google:</strong> Quando alguém pesquisa "${nicheText} em Recife", você aparece. Cliente te acha antes do concorrente.</p>
      <p><strong>2. Converte 24/7:</strong> O site trabalha por você enquanto você dorme. Cliente acessa, vê seus serviços, clica no WhatsApp e te chama — a qualquer hora.</p>
      <p><strong>3. Profissionalismo:</strong> Cliente que vê um site moderno confia mais. Site ruim = "será que o serviço também é ruim?". Site premium = "esse cara é sério".</p>
      <p><strong>4. Escala sem custo:</strong> 10, 100, 1000 visitantes por dia — o custo é o mesmo. Não precisa contratar mais ninguém pra atender mais gente.</p>
    </div>

    <!-- ANCHORING: comparação de valor -->
    <div class="anchor-box">
      <div class="small">O site profissional custa MENOS que:</div>
      <div class="big">1 mês de aluguel da loja</div>
      <div class="small">E diferente do aluguel (que se paga pra sempre), o site é SEU — trabalha 24/7 por anos</div>
    </div>

    <!-- SOCIAL PROOF -->
    <div class="social-proof">
      <div class="stat"><div class="num">+75</div><div class="label">empresas atendidas</div></div>
      <div class="stat"><div class="num">+8 anos</div><div class="label">de experiência</div></div>
      <div class="stat"><div class="num">100%</div><div class="label">sem fidelidade</div></div>
    </div>

    <!-- PRODUTOS -->
    <div class="section-title">📦 Investimento</div>
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

    <!-- CONDIÇÕES -->
    <div class="conditions">
      <h3>Condições que eliminam o risco</h3>
      <ul>
        <li><strong>Parcelamento em até 12x</strong> de ${installment} — cabe no orçamento</li>
        <li><strong>PIX com 5% de desconto</strong> à vista</li>
        <li><strong>Sem fidelidade</strong> — cancele a recorrência quando quiser, sem multa</li>
        <li><strong>Sem trabalho pra você</strong> — eu cuido de tudo (design, conteúdo, publicação)</li>
        <li><strong>Site é seu pra sempre</strong> — entregue com domínio e hospedagem</li>
        <li><strong>Suporte por WhatsApp</strong> durante todo o período</li>
        <li><strong>Garantia implícita:</strong> se não gostar do resultado, ajusto até ficar perfeito</li>
      </ul>
    </div>

    <!-- SCARCITY -->
    <div class="urgency">
      <h3>⏰ Esta proposta é válida até ${validUntil}</h3>
      <p>Após esta data, valores podem sofrer reajuste. Cada mês sem site = 30-50 clientes que não vieram. <strong>Quanto mais cedo começar, mais clientes captura.</strong></p>
    </div>

    <!-- CTA -->
    <div class="cta">
      <a href="https://wa.me/5581920051068?text=${encodeURIComponent(`Olá Clodoaldo! Aceito a proposta de ${totalFormatted} para ${lead.name}. Como prosseguimos?`)}" target="_blank">
        💬 Aceitar proposta no WhatsApp
      </a>
      <p style="margin-top:12px;font-size:11px;color:#999;">Ou me chame pra tirar dúvidas. Sem compromisso, sem pressão.</p>
    </div>
  </div>

  <div class="validity">
    Proposta personalizada para <strong>${lead.name}</strong> • Válida até <strong>${validUntil}</strong>
  </div>
  <div class="footer">
    Clodoaldo Silva — Criador e Desenvolvedor Digital<br>
    📱 (81) 92005-1068 • 🌐 clodoaldo.vercel.app • 📅 cal.com/clodoaldo-silva-y3si2j/30min
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
