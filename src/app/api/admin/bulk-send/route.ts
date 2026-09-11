import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { normalizeBrazilianPhone } from "@/lib/phone-utils";

/**
 * POST /api/admin/bulk-send
 *
 * Generates personalized short first-touch WhatsApp messages for a batch of leads.
 * Two generation modes:
 *   - style: "ai"        → tries Gemini API, falls back to local smart generation
 *   - style: "template"  → applies one of the predefined templates (templateId required)
 *
 * Body:
 * {
 *   leads: Array<{ id, name, niche?, city?, whatsapp?, phone?, hasWebsite?, rating?, category? }>,
 *   style: "ai" | "template",
 *   templateId?: "t1" | "t2" | "t3" | "t4",
 *   customCta?: string,            // optional override of the final CTA line
 *   campaign?: string              // tag for the envios log
 * }
 *
 * Returns:
 * { results: Array<{ lead, message, waLink, variant }> }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leads: any[] = Array.isArray(body.leads) ? body.leads : [];
    if (leads.length === 0) {
      return NextResponse.json({ error: "Leads array is empty" }, { status: 400 });
    }
    // Hard cap at 30 per request for safety
    const safeLeads = leads.slice(0, 30);

    const style: "ai" | "template" = body.style === "template" ? "template" : "ai";
    const templateId: string = body.templateId || "t1";
    const customCta: string | undefined = body.customCta;
    const campaign: string = body.campaign || `bulk-${new Date().toISOString().slice(0, 10)}`;

    // Generate messages
    let messages: { lead: any; message: string; variant: string }[];

    if (style === "ai") {
      // Try Gemini first
      try {
        messages = await generateWithGemini(safeLeads, customCta);
      } catch (geminiErr: any) {
        console.warn("[bulk-send] Gemini failed, falling back to local:", geminiErr.message);
        messages = generateLocal(safeLeads, customCta, "ai");
      }
    } else {
      messages = generateLocal(safeLeads, customCta, templateId);
    }

    // Build wa.me link + return
    const results = messages.map((m) => {
      const num = normalizeBrazilianPhone(m.lead.whatsapp || m.lead.phone) || "";
      const waLink = num
        ? `https://wa.me/${num}?text=${encodeURIComponent(m.message)}`
        : null;
      return {
        lead: {
          id: m.lead.id,
          place_id: m.lead.place_id, // Include place_id for envios logging lookup
          name: m.lead.name,
          niche: m.lead.niche || m.lead.category,
          city: m.lead.city,
          whatsapp: m.lead.whatsapp,
          phone: m.lead.phone,
        },
        message: m.message,
        waLink,
        variant: m.variant,
        campaign,
      };
    });

    return NextResponse.json({ results, count: results.length, campaign });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================================================
// GEMINI API INTEGRATION (with region fallback)
// =====================================================
async function generateWithGemini(
  leads: any[],
  customCta?: string
): Promise<{ lead: any; message: string; variant: string }[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ctaLine = customCta || "Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌";

  // Build a single batched prompt — Gemini generates N messages in one call
  const leadList = leads
    .map((l, i) => `${i + 1}. Nome: ${l.name} | Nicho: ${l.niche || l.category || "estabelecimento"} | Cidade: ${l.city || "—"} | Avaliação: ${l.rating || "sem avaliação"} | Tem site: ${l.hasWebsite ? "sim" : "não"}`)
    .join("\n");

  const prompt = `Você é um especialista em prospecção via WhatsApp para marketing digital local. Gere UMA mensagem curta para CADA um dos ${leads.length} estabelecimentos abaixo.

FORMATO DE RESPOSTA (OBRIGATÓRIO):
- Responda APENAS com as ${leads.length} mensagens, separadas por uma linha em branco entre elas.
- Cada mensagem DEVE começar com o número entre colchetes: [1], [2], [3], etc.
- Após o número, escreva a mensagem completa em uma única linha (sem quebras de linha dentro da mensagem).

EXEMPLO de formato:
[1] Boa noite! Vi o Barbearia Silva no Google Maps. Notei que ainda não têm site profissional. Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌

[2] Boa tarde! Parabéns pela avaliação de 4.8★! Sou o Clodoaldo, posso ajudar com marketing digital. Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌

REGRA PARA CADA MENSAGEM:
- Cumprimento + nome do estabelecimento + UMA observação (sem site/site ruim/avaliação boa) + CTA: "${ctaLine}"
- Máximo 40 palavras
- Tom amigável, NÃO robótico
- 1 emoji no máximo
- Varie o cumprimento (Bom dia/Boa tarde/Boa noite/Olá/Tudo bem?)
- Em PORTUGUÊS do Brasil
- Sem telefone nem links

Estabelecimentos:
${leadList}

Responda agora com as ${leads.length} mensagens no formato [N] mensagem:`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4000, topP: 0.9 },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${errText.slice(0, 200)}`);
  }
  const data = await resp.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse messages: split by blank lines OR by [N] markers
  // Strategy: use regex to find all [N] ... patterns (greedy until next [N] or end)
  const msgByIndex: Record<number, string> = {};
  // Match [N] followed by message content (until next [N] or end of text)
  const msgRegex = /\[(\d+)\]\s*([^\[]+)/g;
  let match;
  while ((match = msgRegex.exec(text)) !== null) {
    const idx = parseInt(match[1], 10);
    const msg = match[2].trim();
    if (msg) msgByIndex[idx] = msg;
  }

  // Fallback: if regex didn't work, try line-by-line with number prefix
  if (Object.keys(msgByIndex).length < leads.length) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^(\d+)[\.\)]\s+/.test(l));
    for (const line of lines) {
      const m = line.match(/^(\d+)[\.\)]\s+(.+)$/);
      if (m) {
        const idx = parseInt(m[1], 10);
        if (!msgByIndex[idx]) msgByIndex[idx] = m[2].trim();
      }
    }
  }

  // Build results — fall back to local generation for any missing indices
  return leads.map((lead, i) => ({
    lead,
    message: msgByIndex[i + 1] || fallbackMessage(lead, ctaLine),
    variant: msgByIndex[i + 1] ? "ai-gemini" : "ai-local-fallback",
  }));
}

// =====================================================
// LOCAL SMART GENERATION (fallback / template mode)
// =====================================================
const PREP_NICHE: Record<string, string> = {
  restaurante: "no restaurante",
  barbearia: "na barbearia",
  academia: "na academia",
  "salao de beleza": "no salão",
  "clinica estetica": "na clínica",
  "escritorio de advocacia": "no escritório",
  "consultorio odontologico": "no consultório",
  "loja de roupas": "na loja",
  papelaria: "na papelaria",
  farmacia: "na farmácia",
  "pet shop": "no pet shop",
  "estetica automotiva": "na estética automotiva",
  pizzaria: "na pizzaria",
  hamburgueria: "na hamburgueria",
  cafeteria: "na cafeteria",
  "loja de conveniencia": "na loja",
  imobiliaria: "na imobiliária",
  contabilidade: "no escritório de contabilidade",
  "agencia de marketing": "na agência",
  "estudio de pilates": "no estúdio",
};

function nichePrep(niche?: string): string {
  if (!niche) return "no seu estabelecimento";
  const key = niche.toLowerCase().trim();
  return PREP_NICHE[key] || `no ${niche}`;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function fallbackMessage(lead: any, ctaLine: string): string {
  const g = timeGreeting();
  const niche = lead.niche || lead.category || "estabelecimento";
  const where = nichePrep(niche);
  const obs = lead.hasWebsite
    ? `Vi que seu site atual pode estar perdendo clientes por ser lento.`
    : `Notei que ainda não têm um site profissional ${where}.`;
  return `${g}! Vi o ${lead.name} no Google Maps. ${obs} ${ctaLine}`;
}

interface Template {
  id: string;
  name: string;
  build: (lead: any, ctaLine: string) => string;
}

const TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Direto e curto",
    build: (l, cta) => {
      const g = timeGreeting();
      const obs = l.hasWebsite
        ? `Vi que o site de vocês pode estar perdendo clientes.`
        : `Notei que ainda não têm um site profissional.`;
      return `${g}! Vi o ${l.name} no Google Maps e gostei do que encontrei. ${obs} ${cta}`;
    },
  },
  {
    id: "t2",
    name: "Elogio + gancho",
    build: (l, cta) => {
      const g = timeGreeting();
      const elogio = l.rating
        ? `Parabéns pela avaliação de ${l.rating}★ no Google! `
        : "";
      return `${g}! ${elogio}Sou o Clodoaldo, trabalho com marketing digital local aqui em ${l.city || "Recife"}. Tenho uma ideia rápida que pode trazer mais clientes para o ${l.name}. ${cta}`;
    },
  },
  {
    id: "t3",
    name: "Oportunidade local",
    build: (l, cta) => {
      const g = timeGreeting();
      const niche = l.niche || l.category || "estabelecimento";
      const obs = l.hasWebsite
        ? `Pesquisando "${niche} em ${l.city || "sua cidade"}" notei que seu site atual não aparece bem no mobile — e a maioria dos clientes pesquisa pelo celular.`
        : `Pesquisando "${niche} em ${l.city || "sua cidade"}" notei que vocês ainda não têm site — e estão perdendo clientes para concorrentes que têm.`;
      return `${g}! ${obs} Posso ajudar com isso. ${cta}`;
    },
  },
  {
    id: "t4",
    name: "Curto e amigo",
    build: (l, cta) => {
      const g = timeGreeting();
      return `${g}! 👋 Sou o Clodoaldo, crio sites e identidade digital para ${l.niche || "negócios"} aqui da região. Vi o ${l.name} e achei que combina com o que eu faço. ${cta}`;
    },
  },
];

function generateLocal(
  leads: any[],
  customCta: string | undefined,
  mode: string
): { lead: any; message: string; variant: string }[] {
  const ctaLine =
    customCta || "Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌";

  if (mode === "ai") {
    // Local "AI-like" generation: vary across templates + extras for variety
    return leads.map((lead, i) => {
      const tpl = TEMPLATES[i % TEMPLATES.length];
      return {
        lead,
        message: tpl.build(lead, ctaLine),
        variant: `ai-local-${tpl.id}`,
      };
    });
  }

  // Template mode: use the same template for all leads
  const tpl = TEMPLATES.find((t) => t.id === mode) || TEMPLATES[0];
  return leads.map((lead) => ({
    lead,
    message: tpl.build(lead, ctaLine),
    variant: `template-${tpl.id}`,
  }));
}

// GET endpoint exposes the list of templates (used by the UI to render options)
export async function GET() {
  return NextResponse.json({
    templates: TEMPLATES.map((t) => ({ id: t.id, name: t.name })),
  });
}
