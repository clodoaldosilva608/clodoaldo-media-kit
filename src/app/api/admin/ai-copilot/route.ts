import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/ai-copilot
 *
 * Recebe o contexto da conversa (mensagens trocadas + dados do lead) e usa Gemini pra:
 *   1. Classificar temperatura do lead (quente / morno / frio)
 *   2. Sugerir a próxima resposta ideal (personalizada, não genérica)
 *   3. ATUALIZAR a memória persistente do lead (agent_memory table)
 *   4. CARREGAR memória anterior (se lead_id fornecido) pra dar contexto
 *
 * Body: {
 *   lead_id?: string (UUID do crm_leads — se fornecido, carrega e salva memória),
 *   lead_name: string,
 *   niche: string,
 *   city: string,
 *   has_website: boolean,
 *   conversation: Array<{ from: 'lead' | 'me', text: string, timestamp: string }>,
 *   products_summary?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, lead_name, niche, city, has_website, conversation, products_summary } = body;

    if (!lead_name || !conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: "lead_name and conversation[] required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    let sb: any = null;
    let previousMemory: any = null;

    // Carregar memória anterior se lead_id foi fornecido
    if (lead_id) {
      try {
        sb = getSupabaseServer();
        const { data: mem, error: memErr } = await sb
          .from("agent_memory")
          .select("*")
          .eq("lead_id", lead_id)
          .maybeSingle();

        if (memErr && !memErr.message.includes("Does not exist")) {
          console.warn("[ai-copilot] Memory load warning:", memErr.message);
        }
        previousMemory = mem;
      } catch (e: any) {
        console.warn("[ai-copilot] Memory load failed:", e.message);
      }
    }

    // Monta histórico da conversa em texto
    const conversationText = conversation
      .map((m: any) => {
        const who = m.from === "lead" ? lead_name : "Clodoaldo";
        return `${who}: ${m.text}`;
      })
      .join("\n");

    // Constrói seção de memória anterior (se existir)
    const memorySection = previousMemory
      ? `
MEMÓRIA DE CONVERSAS ANTERIORES (use isso pra personalizar a resposta):
- Resumo último contato: ${previousMemory.conversation_summary || "nenhum"}
- Histórico de temperatura: ${(previousMemory.temperature_history || []).join(" → ") || "nenhum"}
- Objeções já levantadas pelo lead: ${(previousMemory.key_objections || []).join("; ") || "nenhuma"}
- Próxima ação sugerida anteriormente: ${previousMemory.next_action_suggested || "nenhuma"}
- Número de conversas anteriores: ${previousMemory.conversation_count || 0}
- Última interação: ${previousMemory.last_interaction_at ? new Date(previousMemory.last_interaction_at).toLocaleString("pt-BR") : "nunca"}

IMPORTANTE: Aja como se lembrasse do lead. Se ele já levantou objeção X antes, NÃO repita a mesma resposta — evolua a conversa. Se a temperatura mudou desde a última conversa, ack isso.
`
      : "";

    const prompt = `Você é o assistente de IA do Clodoaldo Silva (criador de sites e marketing digital local). Analise a conversa abaixo e responda APENAS com JSON válido (sem markdown, sem comentários):

Contexto do lead:
- Nome: ${lead_name}
- Nicho: ${niche || "negócio local"}
- Cidade: ${city || "Recife, PE"}
- Tem site: ${has_website ? "Sim" : "Não"}
- Produtos disponíveis: ${products_summary || "Site profissional, SEO local, Google Meu Negócio, Cardápio digital, Artes redes sociais, Pacote recorrência mensal"}
${memorySection}
Conversa atual:
${conversationText}

Responda com este JSON exato:
{
  "temperature": "quente" | "morno" | "frio",
  "temperature_reason": "explicação breve de porquê essa temperatura (1 frase)",
  "suggested_reply": "a próxima mensagem que o Clodoaldo deve enviar (personalizada, natural, em português, máximo 4 linhas, sem emojis excessivos)",
  "next_action": "ação recomendada para o Clodoaldo (ex: 'Enviar proposta com valores', 'Agendar call', 'Follow-up em 3 dias', 'Encerrar lead')",
  "memory_update": {
    "conversation_summary": "resumo conciso desta conversa (1-2 frases, focando no que foi decidido/próximo passo)",
    "key_objections": ["array de objeções levantadas pelo lead nesta conversa — se nenhuma, array vazio"],
    "next_action_suggested": "próxima ação recomendada (igual ao campo next_action acima)"
  }
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
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
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

    // Parse JSON da resposta
    let parsed: any = null;
    try {
      let cleanText = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      try {
        parsed = JSON.parse(cleanText);
      } catch {
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

    // Salvar memória atualizada se lead_id foi fornecido
    if (lead_id && sb && parsed.memory_update) {
      try {
        const newTemp = parsed.temperature;
        const tempHistory = previousMemory?.temperature_history || [];
        // Adiciona nova temperatura no histórico (máx 10)
        const updatedTempHistory = [...tempHistory, newTemp].slice(-10);

        const objHistory = previousMemory?.key_objections || [];
        const newObjHistory = [...new Set([...objHistory, ...(parsed.memory_update.key_objections || [])])].slice(0, 20);

        const newCount = (previousMemory?.conversation_count || 0) + 1;

        const { error: upsertErr } = await sb
          .from("agent_memory")
          .upsert({
            lead_id,
            conversation_summary: parsed.memory_update.conversation_summary || null,
            temperature_history: updatedTempHistory,
            key_objections: newObjHistory,
            next_action_suggested: parsed.memory_update.next_action_suggested || null,
            last_interaction_at: new Date().toISOString(),
            conversation_count: newCount,
            updated_at: new Date().toISOString(),
          }, { onConflict: "lead_id" });

        if (upsertErr && !upsertErr.message.includes("Does not exist")) {
          console.warn("[ai-copilot] Memory save warning:", upsertErr.message);
        }
      } catch (e: any) {
        console.warn("[ai-copilot] Memory save failed:", e.message);
      }
    }

    // Resposta não inclui memory_update no body (só usado internamente)
    const { memory_update, ...responsePayload } = parsed;

    // Inclui info de memória na resposta (debug/info)
    if (lead_id) {
      responsePayload.memory_info = {
        loaded: !!previousMemory,
        saved: true,
        conversation_count: (previousMemory?.conversation_count || 0) + 1,
      };
    }

    return NextResponse.json(responsePayload);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
