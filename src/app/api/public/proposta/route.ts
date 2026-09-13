import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/public/proposta
 *
 * Gera HTML de uma CARTA DE VENDAS persuasiva (não tabela de preços).
 * Foco em neurociência comportamental aplicada à conversão:
 * - Reciprocity (demo já entregue de graça)
 * - Loss Aversion (o que perde por dia/mês sem site)
 * - Future Pacing (imagine daqui 90 dias)
 * - Value Stack (empilhar valor percebido, sem revelar preço)
 * - Authority (8+ anos, 75+ empresas)
 * - Social Proof (números, resultados)
 * - Risk Reversal (sem fidelidade, site é seu, suporte direto)
 * - Scarcity + Urgency (validade 7 dias + custo invisível de esperar)
 * - CTA Múltiplo → WhatsApp para definir investimento
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
    const validDays = 7;
    const validUntilMs = Date.now() + validDays * 24 * 60 * 60 * 1000;
    const validUntil = new Date(validUntilMs).toLocaleDateString("pt-BR");
    const demoUrl = lead.demo_url || `https://clodoaldo.vercel.app/api/preview?lead=${lead.id}&style=dark`;

    // Nicho para personalização
    const nicheText = lead.notes?.match(/Nicho: ([^,\n]+)/)?.[1] || lead.intent || "seu nicho";
    const cidade = lead.notes?.match(/Cidade: ([^,\n]+)/)?.[1] || lead.city || "sua região";
    const firstName = (lead.name || "empreendedor").split(" ")[0];

    // Lista de produtos/serviços incluídos (VALUE STACK — sem preço)
    const valueStack = (products || []).map((p: any, i: number) => `
      <div class="value-item">
        <div class="value-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="value-content">
          <div class="value-title">${p.icon || "✅"} ${p.name}</div>
          <div class="value-desc">${p.description || "Incluso no seu projeto."}</div>
        </div>
        <div class="value-check">✓</div>
      </div>
    `).join("");

    const whatsappLink = `https://wa.me/5581920051068?text=${encodeURIComponent(
      `Olá Clodoaldo! Acabei de ler a proposta que você preparou para ${lead.name}. Quero entender melhor o investimento e como começamos. Pode me explicar?`
    )}`;

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plano de Crescimento Digital — ${lead.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; color: #1a1a1a; padding: 20px; line-height: 1.7; }
  .container { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }

  /* HEADER premium */
  .header { background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f1f1a 100%); color: #fff; padding: 40px 32px; text-align: center; position: relative; }
  .header::after { content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #10b981, #34d399, #10b981); }
  .header .badge { display: inline-block; background: rgba(16,185,129,0.15); color: #34d399; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
  .header h1 { font-size: 26px; font-weight: 800; line-height: 1.2; }
  .header .subtitle { font-size: 13px; opacity: 0.7; margin-top: 8px; }
  .header .meta { font-size: 11px; opacity: 0.5; margin-top: 12px; }

  .body { padding: 40px 32px; }

  /* Personalização */
  .lead-card { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin-bottom: 28px; text-align: center; }
  .lead-card .for { font-size: 10px; color: #047857; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  .lead-card h2 { font-size: 22px; color: #064e3b; margin: 6px 0 4px; font-weight: 800; }
  .lead-card p { font-size: 12px; color: #065f46; }

  /* Letter style */
  .letter p { font-size: 14px; color: #2a2a2a; margin-bottom: 14px; line-height: 1.75; }
  .letter .signature { font-size: 13px; color: #555; margin-top: 18px; font-style: italic; }

  /* Demo box (RECIPROCITY) */
  .demo-box { background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 14px; padding: 24px; margin: 24px 0; text-align: center; }
  .demo-box .demo-label { font-size: 10px; color: #047857; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
  .demo-box h3 { font-size: 18px; color: #064e3b; margin: 8px 0 12px; font-weight: 800; }
  .demo-box a { color: #047857; font-weight: 700; text-decoration: underline; word-break: break-all; font-size: 13px; display: block; margin: 12px 0; }
  .demo-box .note { font-size: 11px; color: #065f46; margin-top: 8px; }

  /* LOSS AVERSION */
  .pain-section { background: #fef2f2; border-left: 5px solid #dc2626; border-radius: 10px; padding: 24px; margin: 28px 0; }
  .pain-section .tag { display: inline-block; background: #dc2626; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .pain-section h3 { font-size: 17px; color: #7f1d1d; margin-bottom: 14px; font-weight: 800; }
  .pain-section p { font-size: 13.5px; color: #7f1d1d; margin-bottom: 12px; line-height: 1.7; }
  .pain-section .highlight { background: rgba(220,38,38,0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700; }
  .calc-box { background: #fff; border: 2px dashed #fca5a5; border-radius: 10px; padding: 18px; margin-top: 14px; text-align: center; }
  .calc-box .label { font-size: 11px; color: #991b1b; text-transform: uppercase; letter-spacing: 1px; }
  .calc-box .big { font-size: 32px; font-weight: 900; color: #dc2626; margin: 8px 0; }
  .calc-box .small { font-size: 12px; color: #7f1d1d; }

  /* FUTURE PACE */
  .future-section { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-left: 5px solid #10b981; border-radius: 10px; padding: 24px; margin: 28px 0; }
  .future-section .tag { display: inline-block; background: #10b981; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .future-section h3 { font-size: 17px; color: #064e3b; margin-bottom: 14px; font-weight: 800; }
  .future-section p { font-size: 13.5px; color: #064e3b; margin-bottom: 12px; line-height: 1.7; }
  .future-section strong { color: #064e3b; }

  /* VALUE STACK */
  .value-section { margin: 32px 0; }
  .value-section .section-title { font-size: 18px; font-weight: 800; color: #0a0a0a; margin-bottom: 8px; }
  .value-section .section-sub { font-size: 12px; color: #888; margin-bottom: 18px; }
  .value-item { display: flex; align-items: center; background: #fff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; gap: 14px; transition: all 0.2s; }
  .value-item:hover { border-color: #10b981; transform: translateX(2px); }
  .value-num { background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 800; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .value-content { flex: 1; }
  .value-title { font-weight: 700; color: #0a0a0a; font-size: 14px; }
  .value-desc { font-size: 11.5px; color: #777; margin-top: 2px; line-height: 1.4; }
  .value-check { color: #10b981; font-size: 18px; font-weight: 700; }

  /* AUTHORITY */
  .authority-section { background: linear-gradient(135deg, #fafafa, #f5f5f5); border-radius: 12px; padding: 22px; margin: 28px 0; border: 1px solid #e5e7eb; }
  .authority-section h3 { font-size: 16px; color: #0a0a0a; margin-bottom: 12px; font-weight: 800; }
  .authority-section p { font-size: 13.5px; color: #444; margin-bottom: 10px; line-height: 1.7; }
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
  .stat-card { background: #fff; border-radius: 10px; padding: 14px 8px; text-align: center; border: 1px solid #e5e7eb; }
  .stat-card .num { font-size: 22px; font-weight: 900; color: #10b981; }
  .stat-card .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

  /* RISK REVERSAL */
  .risk-section { background: #fff7ed; border: 2px solid #fdba74; border-radius: 12px; padding: 22px; margin: 28px 0; }
  .risk-section h3 { font-size: 16px; color: #7c2d12; margin-bottom: 12px; font-weight: 800; }
  .risk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .risk-item { background: #fff; border-radius: 8px; padding: 12px; font-size: 12px; color: #7c2d12; display: flex; align-items: flex-start; gap: 8px; }
  .risk-item .icon { color: #ea580c; font-weight: 800; flex-shrink: 0; }
  .risk-item strong { display: block; margin-bottom: 2px; color: #7c2d12; }

  /* SCARCITY */
  .scarcity { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fca5a5; border-radius: 14px; padding: 22px; margin: 28px 0; text-align: center; }
  .scarcity .timer-icon { font-size: 28px; }
  .scarcity h3 { font-size: 17px; color: #991b1b; margin: 8px 0; font-weight: 800; }
  .scarcity p { font-size: 13px; color: #7f1d1d; line-height: 1.6; max-width: 480px; margin: 0 auto; }

  /* CTA */
  .cta-box { background: linear-gradient(135deg, #0a0a0f, #1a1a2e); color: #fff; border-radius: 16px; padding: 32px 24px; margin: 32px 0; text-align: center; }
  .cta-box h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
  .cta-box p { font-size: 13px; opacity: 0.85; margin-bottom: 20px; line-height: 1.6; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 18px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 8px 24px rgba(16,185,129,0.4); transition: transform 0.2s; }
  .cta-button:hover { transform: translateY(-2px); }
  .cta-note { font-size: 11px; opacity: 0.6; margin-top: 14px; }

  /* Inline CTA */
  .inline-cta { text-align: center; margin: 20px 0; }
  .inline-cta a { display: inline-block; background: #10b981; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(16,185,129,0.25); }

  /* P.S. */
  .ps { background: #f9fafb; border-radius: 12px; padding: 22px; margin: 28px 0; border-left: 4px solid #6366f1; }
  .ps .ps-label { font-size: 14px; font-weight: 800; color: #4338ca; margin-bottom: 8px; }
  .ps p { font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 10px; }

  .footer { text-align: center; padding: 24px 16px; font-size: 11px; color: #999; background: #fafafa; border-top: 1px solid #eee; }
  .footer strong { color: #555; }

  /* COUNTDOWN TIMER — sticky no topo */
  .countdown-bar { position: sticky; top: 0; z-index: 100; background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fff; padding: 10px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .countdown-bar .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
  .countdown-bar .timer { display: flex; gap: 6px; align-items: center; }
  .countdown-bar .unit { background: rgba(0,0,0,0.35); border-radius: 8px; padding: 6px 10px; min-width: 48px; text-align: center; font-weight: 800; font-size: 14px; font-variant-numeric: tabular-nums; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
  .countdown-bar .unit .num { display: block; font-size: 18px; line-height: 1; }
  .countdown-bar .unit .lbl { display: block; font-size: 8px; opacity: 0.7; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px; }
  .countdown-bar .sep { font-weight: 800; opacity: 0.5; font-size: 16px; }
  .countdown-bar.expired { background: linear-gradient(135deg, #b45309, #92400e); animation: pulseExpired 1.5s ease-in-out infinite; }
  @keyframes pulseExpired { 0%,100% { box-shadow: 0 4px 16px rgba(0,0,0,0.2); } 50% { box-shadow: 0 4px 24px rgba(245,158,11,0.6); } }
  .countdown-bar.urgent { animation: pulseUrgent 1s ease-in-out infinite; }
  @keyframes pulseUrgent { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
  .countdown-bar.urgent .unit { background: rgba(0,0,0,0.55); }

  /* MODAL OFERTA SURPRESA */
  .surpresa-overlay { position: fixed; inset: 0; background: rgba(10,10,15,0.85); backdrop-filter: blur(6px); z-index: 1000; display: none; align-items: center; justify-content: center; padding: 20px; }
  .surpresa-overlay.show { display: flex; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .surpresa-modal { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 3px solid #f59e0b; border-radius: 20px; max-width: 540px; width: 100%; padding: 36px 28px; text-align: center; position: relative; box-shadow: 0 20px 60px rgba(245,158,11,0.4); animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1); }
  @keyframes slideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  .surpresa-modal .badge-surpresa { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(245,158,11,0.4); animation: pulseBadge 1.5s ease-in-out infinite; }
  @keyframes pulseBadge { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  .surpresa-modal h2 { font-size: 24px; font-weight: 900; color: #7c2d12; line-height: 1.2; margin-bottom: 10px; }
  .surpresa-modal .surpresa-sub { font-size: 14px; color: #92400e; margin-bottom: 22px; line-height: 1.6; }
  .surpresa-modal .surpresa-bonus { background: #fff; border: 2px dashed #f59e0b; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: left; }
  .surpresa-modal .surpresa-bonus .bonus-title { font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; text-align: center; }
  .surpresa-modal .surpresa-bonus ul { list-style: none; }
  .surpresa-modal .surpresa-bonus li { font-size: 13px; color: #7c2d12; padding: 6px 0; display: flex; align-items: flex-start; gap: 8px; }
  .surpresa-modal .surpresa-bonus li::before { content: "🎁"; flex-shrink: 0; }
  .surpresa-modal .surpresa-cta { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 16px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 8px 20px rgba(16,185,129,0.4); margin-top: 16px; }
  .surpresa-modal .surpresa-cta:hover { transform: translateY(-2px); }
  .surpresa-modal .surpresa-extra-timer { font-size: 13px; color: #7c2d12; margin-top: 14px; font-weight: 700; }
  .surpresa-modal .surpresa-extra-timer .extra-timer-display { color: #dc2626; font-weight: 900; font-size: 16px; font-variant-numeric: tabular-nums; }
  .surpresa-modal .surpresa-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 22px; color: #92400e; cursor: pointer; opacity: 0.5; line-height: 1; }
  .surpresa-modal .surpresa-close:hover { opacity: 1; }
  .surpresa-modal .surpresa-fine { font-size: 10px; color: #a16207; margin-top: 12px; opacity: 0.7; }

  @media print {
    body { background: #fff; padding: 0; }
    .container { box-shadow: none; border-radius: 0; }
    .cta-button { box-shadow: none; }
    .countdown-bar, .surpresa-overlay { display: none !important; }
  }
  @media (max-width: 600px) {
    body { padding: 8px; }
    .body { padding: 24px 18px; }
    .header { padding: 28px 18px; }
    .header h1 { font-size: 22px; }
    .stats-row { grid-template-columns: 1fr; }
    .risk-grid { grid-template-columns: 1fr; }
    .value-item { padding: 12px; gap: 10px; }
    .value-num { width: 30px; height: 30px; font-size: 11px; }
  }
</style></head><body>

<!-- COUNTDOWN BAR (sticky no topo) -->
<div id="countdownBar" class="countdown-bar">
  <div class="label">⏰ Esta proposta expira em</div>
  <div class="timer">
    <div class="unit"><span class="num" id="cdDays">--</span><span class="lbl">dias</span></div>
    <span class="sep">:</span>
    <div class="unit"><span class="num" id="cdHours">--</span><span class="lbl">horas</span></div>
    <span class="sep">:</span>
    <div class="unit"><span class="num" id="cdMins">--</span><span class="lbl">min</span></div>
    <span class="sep">:</span>
    <div class="unit"><span class="num" id="cdSecs">--</span><span class="lbl">seg</span></div>
  </div>
</div>

<div class="container">
  <div class="header">
    <div class="badge">📋 Proposta Exclusiva</div>
    <h1>Plano de Crescimento Digital</h1>
    <div class="subtitle">Projetado manualmente para acelerar a captação de clientes do seu negócio</div>
    <div class="meta">Emitida em ${today} • Válida até ${validUntil}</div>
  </div>

  <div class="body">

    <div class="lead-card">
      <div class="for">Preparada exclusivamente para</div>
      <h2>${lead.name}</h2>
      <p>${nicheText} • ${cidade} • ${lead.whatsapp || ""}</p>
    </div>

    <!-- LETTER OPENING — Storytelling, hook, reciprocity -->
    <div class="letter">
      <p>Olá <strong>${firstName}</strong>,</p>
      <p>Antes de qualquer coisa: <strong>eu já comecei o trabalho pra você</strong>. Enquanto outros profissionais pedem 30 dias só pra te mandar um orçamento frio, eu já deixei pronto um <strong>preview do seu novo site</strong> — criado manualmente, com base no seu nicho, na sua cidade, no seu público.</p>
      <p>Não é um template genérico. É <strong>o seu site</strong>, do seu jeito, pronto pra você ver com os próprios olhos como vai ficar. Sem custo, sem compromisso, sem letra miúda.</p>
      <p>Essa proposta que você está lendo agora não é só uma lista de serviços. É o <strong>plano completo de crescimento digital</strong> que preparei pro seu negócio — e ela só existe porque eu enxerguei, nos detalhes do seu nicho, uma oportunidade real de você captar muito mais clientes a partir de amanhã.</p>
      <p class="signature">— Clodoaldo Silva, criador e desenvolvedor digital</p>
    </div>

    <!-- RECIPROCITY: demo box -->
    <div class="demo-box">
      <div class="demo-label">🎁 Já está pronto (de graça)</div>
      <h3>Seu site demonstração está no ar</h3>
      <a href="${demoUrl}" target="_blank">${demoUrl}</a>
      <div class="note">Clica, abre, navega. Esse preview foi construído manualmente pensando no seu negócio. Imagina ele 100% personalizado, com suas fotos, seus serviços, suas cores — pronto pra converter visitantes em clientes.</div>
    </div>

    <!-- LOSS AVERSION — strongest emotion -->
    <div class="pain-section">
      <div class="tag">⚠️ O Custo Invisível de Esperar</div>
      <h3>${firstName}, todo mês sem um site profissional tá te custando dinheiro.</h3>
      <p>Posso ser direto? <strong>Cada dia que você adia essa decisão, clientes seus estão entrando no concorrente.</strong> Não é palpite — é matemática:</p>
      <p><strong>1. Pesquisa no Google.</strong> Toda mês, dezenas de pessoas pesquisam "<span class="highlight">${nicheText} em ${cidade}</span>" no Google. Sem um site otimizado, <strong>todas essas pessoas vão parar no concorrente que aparece primeiro</strong>. Não porque ele é melhor. Só porque ele apareceu.</p>
      <p><strong>2. Cliente que não te acha, não te compra.</strong> 87% dos consumidores pesquisam online antes de decidir onde comprar. Se você não aparece, você <strong>não existe</strong> pra esses 87%. Some do radar. E o cliente vai pra quem apareceu.</p>
      <p><strong>3. Dependência perigosa.</strong> Sem site, você é refém do boca-a-boca e de indicação. Funciona? Funciona. Mas <strong>quando seca, seca</strong>. E ninguém te avisa. Acordou um dia, parou de chover cliente, e você não sabe por quê.</p>

      <div class="calc-box">
        <div class="label">Projeção conservadora de perda</div>
        <div class="big">−30 a −50 clientes/mês</div>
        <div class="small">Em 6 meses: <strong>200+ clientes</strong> que não vieram<br>Em 12 meses: <strong>400+ clientes</strong> que foram pro concorrente<br><br>Cada cliente que não veio é dinheiro que <strong>entrou direto no bolso de quem apareceu primeiro no Google</strong>.</div>
      </div>

      <p style="margin-top: 16px;"><strong>O pior custo é o que você não vê.</strong> Você não vê o cliente que pesquisou, não te achou, e foi pra outro. Você só sente no fim do mês, quando o faturamento não fecha. <strong>Esse é o custo invisível de esperar.</strong></p>
    </div>

    <!-- INLINE CTA -->
    <div class="inline-cta">
      <a href="${whatsappLink}" target="_blank">💬 Vamos conversar sobre seu projeto no WhatsApp</a>
    </div>

    <!-- FUTURE PACE — gain framing -->
    <div class="future-section">
      <div class="tag">✨ Daqui 90 dias</div>
      <h3>Imaginou como o seu negócio vai estar?</h3>
      <p><strong>Cliente te procura no Google</strong> — e te encontra. Não o concorrente. Você.</p>
      <p><strong>Site trabalhando 24/7.</strong> Enquanto você dorme, atende, faz delivery, cuida da família — o site tá lá, captando cliente, mandando direto pro seu WhatsApp. Cliente acorda 3 da manhã com vontade de comprar? Às 3 da manhã ele te manda mensagem. <strong>Sem você precisar fazer nada.</strong></p>
      <p><strong>Profissionalismo que vende.</strong> Cliente entra no site, vê um trabalho limpo, moderno, bem-feito — e pensa: <em>"esse cara é sério"</em>. Site ruim gera desconfiança. Site premium gera confiança. E cliente <strong>compra de quem confia</strong>.</p>
      <p><strong>Escala sem custo.</strong> 10, 100, 1000 visitantes por dia — o custo é o mesmo. Você não precisa contratar mais ninguém pra atender mais gente. O site escala sozinho. <strong>Esse é o poder de ter uma máquina trabalhando por você.</strong></p>
    </div>

    <!-- VALUE STACK — sem preços, só empilhar valor -->
    <div class="value-section">
      <div class="section-title">📦 O que entra no seu projeto</div>
      <div class="section-sub">Tudo isso já tá incluso — não é cobrado à parte, não tem "extra" escondido. Você fecha uma vez, recebe tudo.</div>
      ${valueStack || `
        <div class="value-item">
          <div class="value-num">01</div>
          <div class="value-content">
            <div class="value-title">✅ Site Profissional Premium</div>
            <div class="value-desc">Design moderno, responsivo, otimizado pra conversão e pra Google.</div>
          </div>
          <div class="value-check">✓</div>
        </div>
        <div class="value-item">
          <div class="value-num">02</div>
          <div class="value-content">
            <div class="value-title">✅ Otimização pra Google (SEO)</div>
            <div class="value-desc">Configurado pra você aparecer nas buscas do seu nicho na sua região.</div>
          </div>
          <div class="value-check">✓</div>
        </div>
        <div class="value-item">
          <div class="value-num">03</div>
          <div class="value-content">
            <div class="value-title">✅ Botão Direto de WhatsApp</div>
            <div class="value-desc">Visitante clica uma vez e já tá falando com você. Fim da fricção.</div>
          </div>
          <div class="value-check">✓</div>
        </div>
      `}
    </div>

    <!-- AUTHORITY -->
    <div class="authority-section">
      <h3>💼 Por que eu, e não qualquer um?</h3>
      <p>Porque eu não entrego "um site". Eu entrego um <strong>sistema de captação de clientes</strong>. A diferença é simples: site bonito todo mundo faz. Site que <strong>aparece no Google, converte visitante em cliente e funciona 24/7</strong> — isso pouca gente sabe fazer.</p>
      <p>Eu trabalho manualmente em cada projeto. Não é template, não é automático, não é "pronto em 5 minutos". Cada site é construído pensando no negócio de trás dele — porque um site sem estratégia é só um PDF caro na internet.</p>
      <div class="stats-row">
        <div class="stat-card"><div class="num">+75</div><div class="label">empresas atendidas</div></div>
        <div class="stat-card"><div class="num">+8 anos</div><div class="label">de experiência real</div></div>
        <div class="stat-card"><div class="num">100%</div><div class="label">sem fidelidade</div></div>
      </div>
    </div>

    <!-- RISK REVERSAL -->
    <div class="risk-section">
      <h3>🛡️ Tudo pra você decidir sem medo</h3>
      <div class="risk-grid">
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Sem fidelidade</strong>Você cancela a recorrência quando quiser, sem multa, sem burocracia.</div>
        </div>
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Site é seu pra sempre</strong>Entregue com domínio e hospedagem. Seu patrimônio digital.</div>
        </div>
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Suporte direto comigo</strong>Você fala com quem fez. Não com estagiário, não com robô.</div>
        </div>
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Sem trabalho pra você</strong>Eu cuido de tudo: design, conteúdo, publicação, domínio.</div>
        </div>
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Ajusto até ficar perfeito</strong>Se não gostar de algum detalhe, a gente ajusta junto.</div>
        </div>
        <div class="risk-item">
          <div class="icon">✓</div>
          <div><strong>Condições que cabem no seu momento</strong>PIX, cartão, parcelamento — a gente combina.</div>
        </div>
      </div>
    </div>

    <!-- SCARCITY + URGENCY -->
    <div class="scarcity">
      <div class="timer-icon">⏰</div>
      <h3>Esta proposta é válida até ${validUntil}</h3>
      <p>Depois dessa data, condições podem mudar. Mas o verdadeiro custo de esperar não é o reajuste — é cada cliente que continua indo pro concorrente enquanto você decide. <strong>Cada mês sem site = 30 a 50 clientes que não vieram.</strong> Quanto mais cedo começar, mais clientes captura.</p>
    </div>

    <!-- MAIN CTA — define investimento no WhatsApp -->
    <div class="cta-box">
      <h3>Vamos definir seu investimento no WhatsApp?</h3>
      <p>Cada negócio é único, no seu ritmo, no seu momento. Por isso o investimento <strong>não é fixo</strong> — ele é construído junto com você, considerando o que faz sentido pro seu caixa hoje. PIX com desconto, cartão parcelado, combinações de serviços… a gente monta do seu jeito.</p>
      <a href="${whatsappLink}" target="_blank" class="cta-button">💬 Falar com Clodoaldo no WhatsApp</a>
      <div class="cta-note">Resposta rápida, sem compromisso, sem pressão. Só uma conversa de negócio pra destravar o seu crescimento.</div>
    </div>

    <!-- P.S. — último gancho emocional -->
    <div class="ps">
      <div class="ps-label">P.S.</div>
      <p>Se você leu essa proposta até aqui, é porque algo ressoou. Talvez tenha sido o número de clientes que você tá perdendo. Talvez o preview do site que já tá pronto. Talvez a sensação de que <strong>esperar mais um mês não vai te trazer mais cliente nenhum</strong>.</p>
      <p>O custo de fazer nada continua o mesmo. O custo de fazer agora só diminui com o tempo — porque cada dia a mais com site = mais cliente capturando = mais faturamento entrando. <strong>A matemática é simples.</strong></p>
      <p>Me chama no WhatsApp. Bora destravar isso.</p>
    </div>

    <!-- INLINE CTA final -->
    <div class="inline-cta">
      <a href="${whatsappLink}" target="_blank">💬 Quero começar meu projeto agora</a>
    </div>

  </div>

  <div class="footer">
    <strong>Clodoaldo Silva</strong> — Criador e Desenvolvedor Digital<br>
    📱 (81) 92005-1068 • 🌐 clodoaldo.vercel.app • 📅 cal.com/clodoaldo-silva-y3si2j/30min<br>
    Proposta personalizada para <strong>${lead.name}</strong> • Válida até <strong>${validUntil}</strong>
  </div>
</div>

<!-- MODAL OFERTA SURPRESA (aparece quando o cronômetro zera) -->
<div id="surpresaOverlay" class="surpresa-overlay" role="dialog" aria-modal="true" aria-labelledby="surpresaTitle">
  <div class="surpresa-modal">
    <button class="surpresa-close" onclick="document.getElementById('surpresaOverlay').classList.remove('show')" aria-label="Fechar">×</button>
    <div class="badge-surpresa">🚨 Oferta Surpresa de Última Hora</div>
    <h2 id="surpresaTitle">Espera, ${firstName}! Não deixa escapar…</h2>
    <div class="surpresa-sub">
      Sua proposta <strong>venceu</strong>, mas eu não quero que você perca a oportunidade de destravar o crescimento do seu negócio só por alguns dias de indecisão. <br>
      Por isso, decidi fazer algo que <strong>raramente</strong> faço:
    </div>
    <div class="surpresa-bonus">
      <div class="bonus-title">🎁 Prorrogação exclusiva com BÔNUS</div>
      <ul>
        <li><strong>+48 horas extras</strong> pra você decidir com calma</li>
        <li><strong>1 revisão extra grátis</strong> do site depois de pronto (não inclusa no plano base)</li>
        <li><strong>Treinamento pessoal de 30min</strong> comigo pra você tirar máximo proveito do site</li>
        <li><strong>Condição de pagamento estendida</strong> — mais tempo pra parcelar, se precisar</li>
      </ul>
    </div>
    <div class="surpresa-extra-timer">
      ⏰ Esta prorrogação dura apenas:<br>
      <span class="extra-timer-display" id="extraTimer">48:00:00</span>
    </div>
    <a href="${whatsappLink}" target="_blank" class="surpresa-cta">💬 Quero aproveitar a prorrogação agora</a>
    <div class="surpresa-fine">Oferta válida uma única vez. Após o fim do prazo extra, a proposta será arquivada definitivamente.</div>
  </div>
</div>

<script>
(function() {
  const DEADLINE = ${validUntilMs};
  const EXTRA_MS = 48 * 60 * 60 * 1000; // 48h extras
  const bar = document.getElementById('countdownBar');
  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMins');
  const sEl = document.getElementById('cdSecs');
  const overlay = document.getElementById('surpresaOverlay');
  const extraTimerEl = document.getElementById('extraTimer');
  let surpresaShown = false;
  let extraDeadline = 0;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateMain() {
    const now = Date.now();
    const diff = DEADLINE - now;
    if (diff <= 0) {
      // Expirou — mostrar oferta surpresa uma única vez
      bar.classList.add('expired');
      bar.classList.remove('urgent');
      dEl.textContent = '00'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
      bar.querySelector('.label').textContent = '⚠️ Proposta expirada — mas tem oferta surpresa abaixo';
      if (!surpresaShown) {
        surpresaShown = true;
        extraDeadline = now + EXTRA_MS;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
      return;
    }
    // Modo urgente quando faltam menos de 24h
    if (diff < 24 * 60 * 60 * 1000) bar.classList.add('urgent');

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);
    dEl.textContent = pad(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(mins);
    sEl.textContent = pad(secs);
  }

  function updateExtra() {
    if (!extraDeadline) return;
    const diff = extraDeadline - Date.now();
    if (diff <= 0) {
      extraTimerEl.textContent = '00:00:00';
      extraTimerEl.style.color = '#991b1b';
      const cta = overlay.querySelector('.surpresa-cta');
      if (cta) {
        cta.textContent = '⏰ Última chance — falar agora no WhatsApp';
        cta.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
      }
      return;
    }
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);
    extraTimerEl.textContent = pad(hours) + ':' + pad(mins) + ':' + pad(secs);
  }

  // Permite fechar o modal clicando fora (mas continua contando extra timer)
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Tick principal
  updateMain();
  setInterval(function() {
    updateMain();
    updateExtra();
  }, 1000);
})();
</script>
</body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
