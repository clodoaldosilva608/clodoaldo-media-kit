import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  ScriptVars,
  loadVoiceProfile,
  getScriptWithFallback,
} from "@/lib/whatsapp-scripts";

/**
 * POST /api/admin/dynamic-script
 *
 * Gera roteiro WhatsApp dinâmico via Gemini + voice_profile.
 * Faz fallback automático pros roteiros estáticos se:
 *   - voice_profile não existir
 *   - Gemini falhar
 *   - timeout de 8s
 *
 * Body: {
 *   lead_id: string,
 *   nome: string,
 *   nicho: string,
 *   cidade: string,
 *   demo_url: string,
 *   has_site: boolean,
 *   variant: "long" | "loss" | "reciprocity" | "pattern"  // default: "long"
 * }
 *
 * Response: Script (id, variant, technique, description, body) + flag "dynamic"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, nome, nicho, cidade, demo_url, has_site, variant } = body;

    if (!nome) {
      return NextResponse.json({ error: "nome required" }, { status: 400 });
    }

    const sb: any = getSupabaseServer();
    const voice = await loadVoiceProfile(sb);

    const vars: ScriptVars = {
      nome,
      nicho: nicho || "negócio local",
      cidade: cidade || "Recife, PE",
      demoUrl: demo_url || `https://clodoaldo.vercel.app/api/preview?lead=${lead_id || ""}&style=dark`,
      whatsapp: undefined,
    };

    const script = await getScriptWithFallback(
      vars,
      !!has_site,
      voice,
      variant || "long",
    );

    return NextResponse.json({
      ...script,
      dynamic: script.id.startsWith("dynamic-"),
      voice_profile_active: !!voice?.summary,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
