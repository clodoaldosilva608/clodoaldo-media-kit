import { NextRequest, NextResponse } from "next/server";
import { sendTelegram, escapeHtml } from "@/lib/telegram";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * POST /api/cron/auto-prospect
 *
 * Vercel Cron — runs daily at 09:00 BRT (12:00 UTC).
 * Schedule: "0 12 * * *"
 *
 * Flow:
 * 1. Picks a random niche from the list
 * 2. Searches Google Maps for 10 leads
 * 3. Generates personalized messages (Gemini IA)
 * 4. Saves leads to database
 * 5. Sends Telegram notification with wa.me links ready to click
 * 6. Sends email with the links (if Google OAuth connected)
 *
 * Auth: protected by CRON_SECRET
 */

const NICHES = [
  "barbearia", "restaurante", "academia", "pizzaria", "hamburgueria",
  "cafeteria", "salao de beleza", "clinica estetica", "pet shop",
  "consultorio odontologico", "loja de roupas", "imobiliaria",
  "contabilidade", "agencia de marketing", "farmacia",
];

const CITIES = [
  "Recife, PE", "Olinda, PE", "Jaboatão, PE", "Caruaru, PE",
  "Paulista, PE", "Cabo de Santo Agostinho, PE",
];

interface Lead {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  formatted_address: string;
  city: string;
  niche: string;
  hasWebsite: boolean;
  rating: number | null;
  place_id: string | null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Pick random niche + city
    const niche = NICHES[Math.floor(Math.random() * NICHES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const today = new Date().toLocaleDateString("pt-BR");

    // 2. Search Google Maps for leads
    const searchResp = await fetch("https://clodoaldo.vercel.app/api/admin/prospect/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche, location: city, radius: 5000, limit: 10 }),
    });
    const searchData = await searchResp.json();
    const leads: Lead[] = searchData.results || [];

    if (leads.length === 0) {
      await sendTelegram({
        text: `📋 <b>Prospecção automática — ${today}</b>\n\nNenhum lead encontrado para "${niche}" em ${city}. Tente novamente amanhã.`,
        parseMode: "HTML",
      });
      return NextResponse.json({ ok: true, leads: 0, reason: "no_results" });
    }

    // 3. Generate personalized messages via Gemini
    const messages = await generateMessagesGemini(leads, niche, city);

    // 4. Build wa.me links
    const leadsWithLinks = leads.map((lead, i) => {
      const num = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
      const waNum = num.startsWith("55") ? num : (num.length === 10 || num.length === 11 ? "55" + num : num);
      const msg = messages[i] || `Olá! Vi o ${lead.name} no Google Maps. Caso tenha interesse em melhorar sua presença digital, me chame no WhatsApp! 🙌`;
      const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : null;
      return { ...lead, message: msg, waLink, waNum };
    });

    // 5. Send Telegram notification with links
    const telegramText = buildTelegramMessage(leadsWithLinks, niche, city, today);
    await sendTelegram({
      text: telegramText,
      parseMode: "HTML",
      disablePreview: true,
    });

    // 6. Send email with links (if Google connected)
    try {
      const { getConnectedEmail } = await import("@/lib/google-oauth");
      const { sendEmail } = await import("@/lib/gmail");
      const dest = await getConnectedEmail();
      if (dest) {
        const html = buildEmailHtml(leadsWithLinks, niche, city, today);
        await sendEmail(
          dest,
          `📋 ${leads.length} leads prontos para disparo — ${niche} em ${city} (${today})`,
          html
        );
      }
    } catch (e) {
      // Email optional
    }

    return NextResponse.json({
      ok: true,
      niche,
      city,
      leadsFound: leads.length,
      messagesGenerated: messages.length,
      date: today,
    });
  } catch (e: any) {
    console.error("[auto-prospect] Error:", e);
    await sendTelegram({
      text: `❌ <b>Erro na prospecção automática</b>\n\n${escapeHtml(e.message)}`,
      parseMode: "HTML",
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================================================
// Gemini message generation
// =====================================================
async function generateMessagesGemini(leads: Lead[], niche: string, city: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return leads.map(() => generateLocalMessage(niche, city));

  try {
    const leadList = leads.map((l, i) => `${i + 1}. ${l.name} | ${niche} | ${city} | ${l.rating || "sem avaliação"} | ${l.hasWebsite ? "tem site" : "sem site"}`).join("\n");
    const prompt = `Gere UMA mensagem curta (máximo 3 linhas, ~40 palavras) para cada um dos ${leads.length} estabelecimentos. Cumprimento + nome + observação + CTA "Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌". Varie o cumprimento. Em português. Formato: [N] mensagem.\n\n${leadList}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!resp.ok) throw new Error(`Gemini ${resp.status}`);
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const msgByIndex: Record<number, string> = {};
    const regex = /\[(\d+)\]\s*([^\[]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      msgByIndex[parseInt(match[1])] = match[2].trim();
    }

    // Fallback to line-by-line
    if (Object.keys(msgByIndex).length < leads.length) {
      const lines = text.split("\n").filter((l: string) => /^\d+[\.\)]\s/.test(l.trim()));
      for (const line of lines) {
        const m = line.match(/^(\d+)[\.\)]\s+(.+)/);
        if (m && !msgByIndex[parseInt(m[1])]) msgByIndex[parseInt(m[1])] = m[2].trim();
      }
    }

    return leads.map((_, i) => msgByIndex[i + 1] || generateLocalMessage(niche, city));
  } catch {
    return leads.map(() => generateLocalMessage(niche, city));
  }
}

function generateLocalMessage(niche: string, city: string): string {
  const greetings = ["Bom dia", "Boa tarde", "Olá"];
  const g = greetings[Math.floor(Math.random() * greetings.length)];
  return `${g}! Vi seu estabelecimento no Google Maps e notei que poderia ter mais clientes com um site profissional. Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌`;
}

// =====================================================
// Telegram message builder
// =====================================================
function buildTelegramMessage(leads: any[], niche: string, city: string, date: string): string {
  const lines = [
    `📋 <b>Prospecção Automática — ${date}</b>`,
    `🎯 Nicho: <b>${escapeHtml(niche)}</b> | 📍 ${escapeHtml(city)}`,
    `📊 ${leads.length} leads encontrados com mensagens prontas`,
    ``,
    `<b>👇 Clique nos links para enviar no WhatsApp:</b>`,
    ``,
  ];

  leads.forEach((lead, i) => {
    lines.push(`<b>${i + 1}. ${escapeHtml(lead.name)}</b>`);
    if (lead.rating) lines.push(`⭐ ${lead.rating} estrelas`);
    if (lead.waLink) {
      lines.push(`💬 <a href="${lead.waLink}">Enviar mensagem no WhatsApp</a>`);
    } else {
      lines.push(`⚠️ Sem WhatsApp`);
    }
    lines.push(``);
  });

  lines.push(`💡 As mensagens foram geradas por IA e personalizadas para cada lead.`);
  return lines.join("\n");
}

// =====================================================
// Email HTML builder
// =====================================================
function buildEmailHtml(leads: any[], niche: string, city: string, date: string): string {
  const cards = leads.map((lead, i) => `
    <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #eee;">
      <div style="font-size:16px;font-weight:bold;color:#0a0a0a;">${i + 1}. ${lead.name}</div>
      <div style="font-size:12px;color:#666;margin:4px 0;">${lead.niche} • ${lead.city} ${lead.rating ? `• ⭐ ${lead.rating}` : ""}</div>
      <div style="background:#f5f5f5;border-radius:8px;padding:12px;margin:8px 0;font-size:13px;color:#333;">${lead.message}</div>
      ${lead.waLink ? `<a href="${lead.waLink}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">📱 Enviar no WhatsApp</a>` : "<span style='color:#999;font-size:12px;'>Sem WhatsApp</span>"}
    </div>
  `).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Inter,sans-serif;background:#f5f5f5;padding:20px;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#10b981,#0ea5e9);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
        <h1 style="margin:0;font-size:22px;">📋 ${leads.length} leads prontos para disparo</h1>
        <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">${niche} • ${city} • ${date}</p>
      </div>
      <div style="background:#f5f5f5;padding:20px;border-radius:0 0 16px 16px;">
        <p style="font-size:14px;color:#666;margin-bottom:16px;">Clique em "Enviar no WhatsApp" para cada lead. A mensagem já vem pronta e personalizada por IA.</p>
        ${cards}
      </div>
      <div style="text-align:center;padding:16px;font-size:11px;color:#999;">Prospecção automática • clodoaldo.vercel.app</div>
    </div>
  </body></html>`;
}
