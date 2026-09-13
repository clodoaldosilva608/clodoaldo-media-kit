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

    const describePrompt = `Você é um diretor de arte. Descreva em UMA frase (máximo 80 palavras) uma imagem hero profissional para um site do nicho "${nicho}"${cidade ? ` em ${cidade}` : ""}.

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
    if (!descResp.ok) {
      return NextResponse.json({ error: `Gemini ${descResp.status}` }, { status: 502 });
    }
    const descData = await descResp.json();
    const imagePrompt = (descData?.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!imagePrompt || imagePrompt.length < 20) {
      return NextResponse.json({ error: "Gemini retornou prompt vazio" }, { status: 502 });
    }

    // 2) z-ai-web-dev-sdk gera a imagem
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const size = "1440x720"; // wide landscape, ideal pra hero

    const imgResp = await zai.images.generations.create({
      prompt: imagePrompt + ", professional photography, high quality, 4k, sharp focus",
      size,
    });

    const base64 = imgResp?.data?.[0]?.base64;
    if (!base64) {
      return NextResponse.json({ error: "Image generation returned empty" }, { status: 502 });
    }

    const buffer = Buffer.from(base64, "base64");

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
