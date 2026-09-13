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

    const describePrompt = `Você é um diretor de arte. Descreva em UMA frase (máximo 80 palavras) uma imagem hero profissional para um site do nicho "${nicho}" em ${cidade}.

A descrição deve:
- Ser visualmente específica (não genérica)
- Incluir elementos reais do nicho (ex: barbearia → tesoura, cadeira, espelho; restaurante → prato, ingredientes, chef)
- Mencionar iluminação, ângulo e mood
- Estilo: ${styleHint}
- NÃO incluir texto na imagem (sem logo, sem palavra)
- NÃO mencionar pessoas reais ou marcas reais
- Ser otimizada pra ser usada como prompt num modelo text-to-image

Responda APENAS com a descrição visual (sem prefixo, sem explicações).`;

    const descResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: describePrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );

    const descRaw = await descResp.json();
    const imagePrompt = (descRaw?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!imagePrompt || imagePrompt.length < 20) {
      return NextResponse.json({
        error: "Gemini returned empty prompt",
        gemini_status: descResp.status,
        gemini_raw: JSON.stringify(descRaw).slice(0, 500),
      }, { status: 502 });
    }

    // 2) Pollinations gera a imagem
    const width = 1440;
    const height = 720;
    const fullPrompt = `${imagePrompt}, professional photography, high quality, 4k, sharp focus, hero banner`;
    const encodedPrompt = encodeURIComponent(fullPrompt).slice(0, 1800);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now() % 1000000}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    let buffer: Buffer;
    try {
      const imgResp = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "ClodoaldoHeroImage/1.0" },
      });
      clearTimeout(timeout);
      if (!imgResp.ok) {
        return NextResponse.json({
          error: `Pollinations HTTP ${imgResp.status}`,
          pollinations_url: pollinationsUrl,
        }, { status: 502 });
      }
      const arrayBuffer = await imgResp.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (e: any) {
      clearTimeout(timeout);
      return NextResponse.json({
        error: `Image fetch failed: ${e.message}`,
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
      gemini_status: descResp.status,
      pollinations_url: pollinationsUrl,
      image_size: buffer.length,
      image_data_url: dataUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
