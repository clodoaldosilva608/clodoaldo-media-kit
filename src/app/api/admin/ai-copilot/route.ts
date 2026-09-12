import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/ai-copilot
 *
 * Recebe o contexto da conversa (mensagens trocadas + dados do lead)
 * e usa Gemini pra:
 *   1. Classificar temperatura do lead (quente / morno / frio)
 *   2. Sugerir a próxima resposta ideal (personalizada, não genérica)
 *
 * Body: {
 *   lead_name: string,
 *   niche: string,
 *   has_website: boolean,
 *   conversation: Array<{ from: 'lead' | 'me', text: string, timestamp: string }>,
 *   products_summary: string  // lista de produtos do catálogo
 * }
 *
 * Response: {
 *   temperature: 'quente' | 'morno' | 'frio',
 *   temperature_reason: string,
 *   suggested_reply: string,
 *   next_action: string,  // ex: "Enviar proposta", "Agendar reunião", "Follow-up em 3 dias"
 * }
 *
 * Custo: ~$0.001 por chamada (Gemini Flash free tier: 1.500/dia)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_name, niche, city, has_website, conversation, products_summary } = body;

    if (!lead_name || !conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: "lead_name and conversation[] required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    // Monta histórico da conversa em texto
    const conversationText = conversation
      .map((m: any) => {
        const who = m.from === "lead" ? lead_name : "Clodoaldo";
        return `${who}: ${m.text}`;
      })
      .join("\n");

    const prompt = `Você é o assistente de IA do Clodoaldo Silva (criador de sites e marketing digital local). Analise a conversa abaixo e responda APENAS com JSON válido (sem markdown, sem comentários):

Contexto do lead:
- Nome: ${lead_name}
- Nicho: ${niche || "negócio local"}
- Cidade: ${city || "Recife, PE"}
- Tem site: ${has_website ? "Sim" : "Não"}
- Produtos disponíveis: ${products_summary || "Site profissional, SEO local, Google Meu Negócio, Cardápio digital, Artes redes sociais, Pacote recorrência mensal"}

Conversa:
${conversationText}

Responda com este JSON exato:
{
  "temperature": "quente" | "morno" | "frio",
  "temperature_reason": "explicação breve de porquê essa temperatura (1 frase)",
  "suggested_reply": "a próxima mensagem que o Clodoaldo deve enviar (personalizada, natural, em português, máximo 4 linhas, sem emojis excessivos)",
  "next_action": "ação recomendada para o Clodoaldo (ex: 'Enviar proposta com valores', 'Agendar call', 'Follow-up em 3 dias', 'Encerrar lead')"
}

Critérios de temperatura:
- QUENTE: lead demonstrou interesse claro, perguntou sobre preço/prazo, ou quer ver o demo
- MORNO: lead respondeu mas não demonstrou interesse forte, está pensando, ou pediu mais info
- FRIO: lead disse que não tem interesse, não tem orçamento, ou parou de responder

A suggested_reply deve ser uma mensagem NATURAL, como se o Clodoaldo estivesse digitando no WhatsApp. NÃO use linguagem corporativa. Seja direto, amigável e específico ao contexto da conversa.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `Gemini ${resp.status}: ${errText.slice(0, 200)}` }, { status: 502 });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("[ai-copilot] Gemini raw response:", text.slice(0, 500));

    // Parse JSON da resposta (Gemini pode envolver em ```json)
    let parsed: any = null;
    try {
      // Remove markdown code blocks se existirem
      let cleanText = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      // Tenta parse direto
      try {
        parsed = JSON.parse(cleanText);
      } catch {
        // Tenta extrair JSON de dentro do texto (encontra primeiro { e último })
        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = cleanText.substring(firstBrace, lastBrace + 1);
          parsed = JSON.parse(jsonStr);
        }
      }
    } catch (e: any) {
      console.error("[ai-copilot] JSON parse error:", e.message, "raw:", text.slice(0, 500));
    }

    if (!parsed) {
      return NextResponse.json({
        temperature: "morno",
        temperature_reason: "Não foi possível classificar. Raw: " + text.slice(0, 500),
        suggested_reply: "Olá! Ainda tem interesse? Posso te enviar uma proposta personalizada.",
        next_action: "Follow-up",
      });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
