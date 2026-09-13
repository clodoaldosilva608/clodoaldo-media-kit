import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test-hero-image?nicho=barbearia&style=modern
 *
 * Endpoint PUBLICO de teste — chama Gemini (descricao) + Pollinations (imagem)
 * e retorna a imagem + prompt usado + analise. Pra validar o pipeline na Vercel.
 *
 * Nao tem auth. Pode ser removido apos validacao.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const nicho = url.searchParams.get("nicho") || "barbearia";
    const cidade = url.searchParams.get("cidade") || "Recife";
    const style = (url.searchParams.get("style") || "modern") as any;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    // 1) Gemini descreve o visual ideal pro nicho
    const styleMap: Record<string, string> = {
      modern: "moderno, clean, com toques de neon sutil, paleta dark com accent vibrante",
      elegant: "elegante e sofisticado, paleta neutra com dourado, iluminação cinematográfica",
      vibrant: "vibrante e energético, cores saturadas, feeling jovem e dinâmico",
      minimal: "minimalista, muito espaço negativo, poucos elementos, tipografia bold",
    };
    const styleHint = styleMap[style] || styleMap.modern;

    const describePrompt = `Você é um diretor de arte criando um prompt para um modelo text-to-image (Stable Diffusion / Flux).

NICHO: ${nicho}
CIDADE: ${cidade || "Recife"}
ESTILO VISUAL: ${styleHint}

Escreva um prompt EM INGLÊS (modelos text-to-image funcionam melhor em inglês) com 60-100 palavras descrevendo uma imagem hero profissional para o site deste nicho.

O prompt DEVE incluir elementos visuais específicos do nicho. Exemplos:
- barbearia → "vintage leather barber chair, large mirror, scissors and straight razor on wooden counter, warm tungsten lighting, dark moody atmosphere, brass accents"
- restaurante → "elegant restaurant interior, set dining table with white linen, wine glasses, candle lighting, gourmet dish on plate, warm ambient lighting"
- academia → "modern gym interior, dumbbells rack, weight machines, dramatic lighting, dark atmosphere with neon accents, polished concrete floor"

REGRAS:
- Comece DIRETO com a descrição (sem "Here is...", sem "Prompt:")
- Inglês apenas
- Mínimo 60 palavras
- Termine com uma frase completa (não corte no meio)
- Não inclua texto/logos na imagem
- Não mencione marcas reais`;

    const descResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: describePrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      }
    );

    const descRaw = await descResp.json();

    // Debug: extrair finishReason e candidatos completos
    const candidate = descRaw?.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const promptFeedback = descRaw?.promptFeedback;
    const rawText = candidate?.content?.parts?.[0]?.text || "";
    let imagePrompt = rawText
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    // Retry se prompt curto demais
    if (!imagePrompt || imagePrompt.length < 100) {
      const retryPrompt = `Write a 60-word image generation prompt in English for a "${nicho}" hero banner. Style: ${styleHint}. Include specific objects from this niche. Start directly with the description. End with a complete sentence.`;
      const retryResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: retryPrompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2000 },
          }),
        }
      );
      if (retryResp.ok) {
        const retryData = await retryResp.json();
        const retryText = (retryData?.candidates?.[0]?.content?.parts?.[0]?.text || "")
          .replace(/```/g, "")
          .replace(/^["']|["']$/g, "")
          .trim();
        if (retryText.length > imagePrompt.length) imagePrompt = retryText;
      }
    }

    // Fallback inteligente em INGLÊS por nicho
    const fallbackMap: Record<string, string> = {
      barbearia: "Vintage leather barber chair, large ornate mirror, scissors and straight razor on wooden counter, warm tungsten lighting, dark moody barbershop atmosphere, brass accents, professional photography, 4k, hero banner",
      restaurante: "Elegant restaurant interior, set dining table with white linen, crystal wine glasses, candle lighting, gourmet dish on plate, warm ambient lighting, sophisticated atmosphere, professional photography, 4k, hero banner",
      academia: "Modern gym interior, dumbbells rack, weight machines, dramatic lighting, dark atmosphere with neon accents, polished concrete floor, athletic equipment, professional photography, 4k, hero banner",
      pizzaria: "Artisanal pizza fresh from wood-fired oven, melted mozzarella, basil leaves, rustic wooden board, warm golden lighting, italian restaurant atmosphere, professional food photography, 4k, hero banner",
      "salao de beleza": "Modern beauty salon interior, styling chairs with large mirrors, hair products on shelf, soft pink lighting, elegant atmosphere, professional photography, 4k, hero banner",
      default: `Professional ${nicho} business interior, specific ${nicho} equipment and furniture, cinematic lighting, 4k professional photography, hero banner`,
    };
    if (!imagePrompt || imagePrompt.length < 100) {
      imagePrompt = fallbackMap[nicho] || fallbackMap.default;
    }

    // 2) Pollinations gera a imagem
    const width = 1440;
    const height = 720;
    const fullPrompt = `${imagePrompt}, professional photography, high quality, 4k, sharp focus, hero banner`;
    const encodedPrompt = encodeURIComponent(fullPrompt).slice(0, 1800);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now() % 1000000}`;

    // Retry em caso de 429 (rate limit do Pollinations)
    let buffer: Buffer;
    let lastErr: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const retryUrl = attempt === 0
          ? pollinationsUrl
          : `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;

        const imgResp = await fetch(retryUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "ClodoaldoHeroImage/1.0" },
        });
        clearTimeout(timeout);

        if (imgResp.status === 429) {
          lastErr = new Error(`Pollinations 429 (rate limit) attempt ${attempt + 1}`);
          await new Promise(r => setTimeout(r, 4000));
          continue;
        }
        if (!imgResp.ok) {
          lastErr = new Error(`Pollinations HTTP ${imgResp.status}`);
          continue;
        }
        const arrayBuffer = await imgResp.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        lastErr = null;
        break;
      } catch (e: any) {
        clearTimeout(timeout);
        lastErr = e;
        if (e.name === 'AbortError') await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (lastErr || !buffer!) {
      return NextResponse.json({
        error: `Image generation failed: ${lastErr?.message || 'no buffer'}`,
      }, { status: 502 });
    }

    // 3) Retornar como data URL + metadados pra inspeção
    const base64 = buffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({
      success: true,
      nicho,
      cidade,
      style,
      prompt_used: imagePrompt,
      raw_gemini_text: rawText,
      gemini_status: descResp.status,
      gemini_finish_reason: finishReason,
      gemini_prompt_feedback: promptFeedback,
      pollinations_url: pollinationsUrl,
      image_size: buffer.length,
      image_data_url: dataUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
