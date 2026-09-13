import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/generate-hero-image
 *
 * Gera imagem hero personalizada pro lead usando:
 *   1. Gemini 3.6 Flash pra descrever visual do nicho
 *   2. z-ai-web-dev-sdk (image generation) pra criar a imagem
 *   3. Supabase Storage pra salvar (bucket: lead-hero-images)
 *
 * Body: {
 *   lead_id: string,
 *   nicho: string,      // ex: "barbearia"
 *   cidade?: string,    // ex: "Recife"
 *   style?: "modern" | "elegant" | "vibrant" | "minimal"  // default: "modern"
 * }
 *
 * Response: { url, prompt_used, size }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, nicho, cidade, style } = body;

    if (!lead_id || !nicho) {
      return NextResponse.json({ error: "lead_id and nicho required" }, { status: 400 });
    }

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
    const styleHint = styleMap[style || "modern"] || styleMap.modern;

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
    if (!descResp.ok) {
      return NextResponse.json({ error: `Gemini ${descResp.status}` }, { status: 502 });
    }
    const descData = await descResp.json();
    let imagePrompt = (descData?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    // Verificar se o prompt está completo (mínimo 100 chars)
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

    // 2) Gerar a imagem via Pollinations.ai (API pública, sem auth)
    //    Anteriormente usávamos z-ai-web-dev-sdk, mas o endpoint interno
    //    (internal-api.z.ai) não é acessível da Vercel e o token era
    //    por chat-session (expira). Pollinations é gratuito e robusto.
    const size = "1440x720"; // wide landscape, ideal pra hero
    const width = 1440;
    const height = 720;

    // Pollinations URL format: https://image.pollinations.ai/prompt/{encoded_prompt}?width=W&height=H&nologo=true&model=flux
    const fullPrompt = `${imagePrompt}, professional photography, high quality, 4k, sharp focus, hero banner`;
    const encodedPrompt = encodeURIComponent(fullPrompt).slice(0, 1800);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now() % 1000000}`;

    // Fetch a imagem como buffer — retry em caso de 429 (rate limit do Pollinations)
    let buffer: Buffer;
    let lastErr: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout
      try {
        // Em cada retry, mudar a seed pra forçar nova geração
        const retryUrl = attempt === 0
          ? pollinationsUrl
          : `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;

        const imgResp = await fetch(retryUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "ClodoaldoHeroImage/1.0" },
        });
        clearTimeout(timeout);

        if (imgResp.status === 429) {
          // Rate limit — espera 4s e tenta de novo
          lastErr = new Error(`Pollinations 429 (rate limit) on attempt ${attempt + 1}`);
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
        // Abort error = timeout — espera 2s antes de retry
        if (e.name === 'AbortError') await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (lastErr || !buffer!) {
      return NextResponse.json({
        error: `Image generation failed after retries: ${lastErr?.message || 'no buffer'}`,
      }, { status: 502 });
    }

    if (!buffer || buffer.length < 1000) {
      return NextResponse.json({ error: "Imagem retornou vazia ou muito pequena" }, { status: 502 });
    }

    const base64 = buffer.toString("base64");

    // 3) Salvar no Supabase Storage
    const sb: any = getSupabaseServer();
    const bucket = process.env.SUPABASE_BUCKET || "lead-hero-images";
    const filename = `hero-${lead_id}-${Date.now()}.png`;
    const path = `${lead_id}/${filename}`;

    let publicUrl: string;
    try {
      // Tentar upload pro bucket
      const { error: uploadErr } = await sb.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadErr) {
        console.warn("[generate-hero-image] Storage upload failed:", uploadErr.message);
        // Fallback: retornar base64 data URL (limitado a ~2MB)
        publicUrl = `data:image/png;base64,${base64}`;
      } else {
        const { data: urlData } = sb.storage
          .from(bucket)
          .getPublicUrl(path);
        publicUrl = urlData?.publicUrl || `data:image/png;base64,${base64}`;
      }
    } catch (e: any) {
      console.warn("[generate-hero-image] Storage error:", e.message);
      publicUrl = `data:image/png;base64,${base64}`;
    }

    // 4) Atualizar lead com a URL da hero
    try {
      await sb.from("crm_leads").update({
        hero_image_url: publicUrl,
        hero_image_prompt: imagePrompt,
        hero_image_generated_at: new Date().toISOString(),
      }).eq("id", lead_id);
    } catch (e: any) {
      console.warn("[generate-hero-image] Lead update warning:", e.message);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      prompt_used: imagePrompt,
      size,
      saved_to_lead: true,
    });
  } catch (e: any) {
    console.error("[generate-hero-image] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
