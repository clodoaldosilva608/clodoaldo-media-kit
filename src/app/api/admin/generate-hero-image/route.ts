import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/generate-hero-image
 *
 * Gera imagem hero personalizada pro lead usando:
 *   1. Gemini 3.6 Flash pra descrever visual do nicho (em inglês, otimizado pra text-to-image)
 *   2. Pollinations.ai (Flux) pra criar a imagem 1440x720
 *   3. Supabase Storage pra salvar (bucket: lead-hero-images)
 *
 * FLUXO COM FALLBACK EM CAMADAS:
 *   1. Tenta Gemini (timeout 12s) — se 429 ou erro, continua
 *   2. Se Gemini falhou, tenta 1 retry com prompt mais direto (timeout 10s)
 *   3. Se ainda falhou, usa fallback hardcoded por nicho (15+ nichos mapeados)
 *   4. Pollinations gera imagem (3 retries com backoff em caso de 429)
 *
 * Body: {
 *   lead_id: string,
 *   nicho: string,      // ex: "barbearia"
 *   cidade?: string,    // ex: "Recife"
 *   style?: "modern" | "elegant" | "vibrant" | "minimal"  // default: "modern"
 * }
 *
 * Response: { url, prompt_used, size, gemini_used }
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

    // Estilos visuais (em português pra Gemini entender contexto)
    const styleMap: Record<string, string> = {
      modern: "moderno, clean, com toques de neon sutil, paleta dark com accent vibrante",
      elegant: "elegante e sofisticado, paleta neutra com dourado, iluminação cinematográfica",
      vibrant: "vibrante e energético, cores saturadas, feeling jovem e dinâmico",
      minimal: "minimalista, muito espaço negativo, poucos elementos, tipografia bold",
    };
    const styleHint = styleMap[style || "modern"] || styleMap.modern;

    // Fallback inteligente em INGLÊS por nicho (usado se Gemini falhar com 429 ou outro erro)
    const fallbackMap: Record<string, string> = {
      barbearia: "Vintage leather barber chair, large ornate mirror, scissors and straight razor on wooden counter, warm tungsten lighting, dark moody barbershop atmosphere, brass accents, professional photography, 4k, hero banner",
      restaurante: "Elegant restaurant interior, set dining table with white linen, crystal wine glasses, candle lighting, gourmet dish on plate, warm ambient lighting, sophisticated atmosphere, professional photography, 4k, hero banner",
      academia: "Modern gym interior, dumbbells rack, weight machines, dramatic lighting, dark atmosphere with neon accents, polished concrete floor, athletic equipment, professional photography, 4k, hero banner",
      pizzaria: "Artisanal pizza fresh from wood-fired oven, melted mozzarella, basil leaves, rustic wooden board, warm golden lighting, italian restaurant atmosphere, professional food photography, 4k, hero banner",
      "salao de beleza": "Modern beauty salon interior, styling chairs with large mirrors, hair products on shelf, soft pink lighting, elegant atmosphere, professional photography, 4k, hero banner",
      "clinica estetica": "Modern aesthetic clinic interior, treatment bed, aesthetic equipment, soft white and beige tones, LED therapy panel, clean minimalist atmosphere, spa lighting, professional photography, 4k, hero banner",
      "clinica-estetica": "Modern aesthetic clinic interior, treatment bed, aesthetic equipment, soft white and beige tones, LED therapy panel, clean minimalist atmosphere, spa lighting, professional photography, 4k, hero banner",
      "pet shop": "Bright pet shop interior, shelves with pet food and toys, dog grooming station, aquariums, small animals, friendly atmosphere, colorful pet products, professional photography, 4k, hero banner",
      petshop: "Bright pet shop interior, shelves with pet food and toys, dog grooming station, aquariums, small animals, friendly atmosphere, colorful pet products, professional photography, 4k, hero banner",
      cafeteria: "Cozy coffee shop interior, espresso machine, wooden counter with pastries, hanging Edison bulbs, barista preparing latte, warm atmosphere, artisanal coffee, professional photography, 4k, hero banner",
      hamburgueria: "Modern burger restaurant interior, gourmet burgers on wooden board, milkshake glasses, neon signs, industrial decor, fries basket, appetizing food photography, 4k, hero banner",
      imobiliaria: "Modern real estate office interior, architectural models on table, large windows with city view, blueprints on wall, sophisticated furniture, professional atmosphere, 4k photography, hero banner",
      contabilidade: "Modern accounting office interior, organized desk with financial documents, computer with charts, calculator, professional books on shelf, neutral tones, business atmosphere, 4k photography, hero banner",
      "consultorio odontologico": "Modern dental office interior, dental chair with overhead light, dental equipment, clean white atmosphere, sterilization area, professional medical photography, 4k, hero banner",
      farmacia: "Modern pharmacy interior, medicine shelves, white counter with pharmacist, health products display, clean medical atmosphere, professional lighting, 4k photography, hero banner",
      "loja de roupas": "Boutique clothing store interior, racks with fashionable clothes, full-length mirrors, mannequins, soft dressing room lighting, modern retail design, professional photography, 4k, hero banner",
      default: `Professional ${nicho} business interior, ${nicho} specific equipment and furniture, cinematic lighting, 4k professional photography, hero banner`,
    };

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

    // ============================================
    // CAMADA 1: Tenta Gemini (timeout 12s)
    // ============================================
    let imagePrompt = "";
    let geminiUsed = false;
    const geminiController = new AbortController();
    const geminiTimeout = setTimeout(() => geminiController.abort(), 12000);

    try {
      const descResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: describePrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
          }),
          signal: geminiController.signal,
        }
      );
      clearTimeout(geminiTimeout);

      if (descResp.ok) {
        const descData = await descResp.json();
        imagePrompt = (descData?.candidates?.[0]?.content?.parts?.[0]?.text || "")
          .replace(/```/g, "")
          .replace(/^["']|["']$/g, "")
          .trim();
        if (imagePrompt.length >= 100) geminiUsed = true;
      }
      // Se 429 ou outro erro, imagePrompt continua vazio → cai no retry/fallback
    } catch (e) {
      clearTimeout(geminiTimeout);
      // AbortError ou fetch failed → cai no retry/fallback
    }

    // ============================================
    // CAMADA 2: Retry com prompt mais direto (timeout 10s)
    // ============================================
    if (!geminiUsed) {
      const retryController = new AbortController();
      const retryTimeout = setTimeout(() => retryController.abort(), 10000);
      try {
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
            signal: retryController.signal,
          }
        );
        clearTimeout(retryTimeout);
        if (retryResp.ok) {
          const retryData = await retryResp.json();
          const retryText = (retryData?.candidates?.[0]?.content?.parts?.[0]?.text || "")
            .replace(/```/g, "")
            .replace(/^["']|["']$/g, "")
            .trim();
          if (retryText.length >= 100) {
            imagePrompt = retryText;
            geminiUsed = true;
          }
        }
      } catch (e) {
        clearTimeout(retryTimeout);
      }
    }

    // ============================================
    // CAMADA 3: Fallback hardcoded por nicho
    // ============================================
    if (!geminiUsed) {
      imagePrompt = fallbackMap[nicho] || fallbackMap.default;
      console.log(`[hero-image] Gemini falhou (429/timeout), usando fallback pra nicho "${nicho}"`);
    }

    // ============================================
    // CAMADA 4: Pollinations gera imagem (3 retries)
    // ============================================
    const size = "1440x720";
    const width = 1440;
    const height = 720;
    const fullPrompt = `${imagePrompt}, professional photography, high quality, 4k, sharp focus, hero banner`;
    const encodedPrompt = encodeURIComponent(fullPrompt).slice(0, 1800);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now() % 1000000}`;

    let buffer: Buffer | null = null;
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

    if (lastErr || !buffer) {
      return NextResponse.json({
        error: `Image generation failed: ${lastErr?.message || 'no buffer'}`,
      }, { status: 502 });
    }

    if (buffer.length < 1000) {
      return NextResponse.json({ error: "Imagem retornou vazia ou muito pequena" }, { status: 502 });
    }

    const base64 = buffer.toString("base64");

    // ============================================
    // CAMADA 5: Salvar no Supabase Storage
    // ============================================
    const sb: any = getSupabaseServer();
    const bucket = process.env.SUPABASE_BUCKET || "lead-hero-images";
    const filename = `hero-${lead_id}-${Date.now()}.png`;
    const path = `${lead_id}/${filename}`;

    let publicUrl: string;
    try {
      const { error: uploadErr } = await sb.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadErr) {
        console.warn("[generate-hero-image] Storage upload failed:", uploadErr.message);
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

    // ============================================
    // CAMADA 6: Atualizar lead com a URL da hero
    // ============================================
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
      gemini_used: geminiUsed,
      fallback_used: !geminiUsed,
      saved_to_lead: true,
    });
  } catch (e: any) {
    console.error("[generate-hero-image] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
