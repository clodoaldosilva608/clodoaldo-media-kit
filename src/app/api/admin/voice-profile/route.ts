import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/voice-profile
 *   Retorna o voice_profile atual (se existir).
 *
 * POST /api/admin/voice-profile
 *   Body: { messages: string[] }  (5-10 mensagens WhatsApp reais do Clodoaldo)
 *   - Envia pro Gemini analisar padrão de escrita
 *   - Salva voice_profile em app_settings.voice_profile
 *   - Retorna o profile criado
 */
const SYSTEM_PROMPT = `Você é um analista de comunicação especializado em identificar padrões de escrita pessoais. Analise as mensagens abaixo (enviadas pelo Clodoaldo Silva no WhatsApp) e extraia o "perfil de voz" dele — pra que uma IA possa redigir mensagens novas soando exatamente como ele.

Responda APENAS com JSON válido (sem markdown):

{
  "greeting_style": "como ele cumprimenta (ex: 'Fala', 'Oi', 'Olá', 'Bom dia')",
  "closing_style": "como ele encerra mensagens (ex: 'Abraço', 'Vlw', 'Tamo junto', sem nada)",
  "tone": "tom geral (ex: 'casual e direto', 'amigável e profissional', 'energético')",
  "formality_level": "informal|neutro|formal",
  "emoji_usage": "nenhum|moderado|intenso + quais emojis prefere",
  "sentence_length": "curta|media|longa",
  "rhythm": "como estrutura frases (ex: 'frases diretas sem rodeios', 'usa reticências', 'perguntas curtas no final')",
  "vocabulary_tics": "palavras ou expressões recorrentes (ex: 'né', 'mano', 'massa', 'bora')",
  "punctuation_style": "como pontua (ex: 'poucos pontos finais', 'usa vírgula muito', 'exclamações frequentes')",
  "preferred_contact_cta": "como chama pra ação (ex: 'me chama no zap', 'te mando agora', 'qualquer coisa me avisa')",
  "avoid_patterns": "o que ele NÃO faz (ex: 'não usa emojis corporativos', 'não escreve parágrafos longos', 'não usa gerúndio')",
  "summary": "descrição em 1-2 frases do estilo geral, pra servir de instrução direta pra outra IA",
  "example_generated": "uma mensagem de exemplo curta (<100 chars) que imita perfeitamente o estilo dele"
}`;

export async function GET() {
  try {
    const sb: any = getSupabaseServer();
    const { data } = await sb.from("app_settings")
      .select("value")
      .eq("key", "voice_profile")
      .maybeSingle();

    return NextResponse.json({
      exists: !!data?.value,
      profile: data?.value || null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length < 3) {
      return NextResponse.json({
        error: "Envie pelo menos 3 mensagens reais para análise",
      }, { status: 400 });
    }

    const validMessages = messages.filter((m: string) => m && m.trim().length > 10);
    if (validMessages.length < 3) {
      return NextResponse.json({
        error: "Mensagens muito curtas. Cole mensagens reais com pelo menos 10 caracteres cada.",
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    const messagesBlock = validMessages
      .map((m: string, i: number) => `[${i + 1}] ${m}`)
      .join("\n\n");

    const prompt = `${SYSTEM_PROMPT}

Mensagens reais do Clodoaldo:
${messagesBlock}

Extraia o perfil de voz. Seja específico e técnico. Não invente — baseie-se apenas no que está nas mensagens. Se não houver informação suficiente pra um campo, use null.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `Gemini ${resp.status}: ${errText.slice(0, 200)}` }, { status: 502 });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON
    let profile: any = null;
    try {
      let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      try {
        profile = JSON.parse(clean);
      } catch {
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          profile = JSON.parse(clean.substring(firstBrace, lastBrace + 1));
        }
      }
    } catch (e: any) {
      console.error("[voice-profile] JSON parse error:", e.message);
    }

    if (!profile) {
      return NextResponse.json({
        error: "Não foi possível extrair o perfil. Tente novamente com mensagens diferentes.",
        raw: text.slice(0, 500),
      }, { status: 502 });
    }

    // Adicionar metadados
    const profileWithMeta = {
      ...profile,
      _meta: {
        sample_count: validMessages.length,
        created_at: new Date().toISOString(),
        model: "gemini-3.6-flash",
      },
    };

    // Salvar em app_settings
    const sb: any = getSupabaseServer();
    const { error: upsertErr } = await sb.from("app_settings").upsert({
      key: "voice_profile",
      value: profileWithMeta,
    }, { onConflict: "key" });

    if (upsertErr) {
      console.warn("[voice-profile] Save warning:", upsertErr.message);
    }

    return NextResponse.json({
      success: true,
      profile: profileWithMeta,
      message: "Perfil de voz salvo. Próximos roteiros IA vão usar seu estilo.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
