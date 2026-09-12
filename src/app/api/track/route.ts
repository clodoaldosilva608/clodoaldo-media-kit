import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/track
 *
 * Endpoint público pra rastrear eventos de analytics no banco analytics_events.
 * Não requer pixel externo (GA4/Meta) nem consentimento de cookies —
 * só registra: event_name, path, user_agent (pra device type), timestamp.
 * Não armazena PII (email, IP completo, etc).
 *
 * Body: { event: "page_view" | "click" | ..., path: "/", props: {...} }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventName = body.event || "page_view";
    const path = body.path || req.headers.get("referer") || "/";
    const props = body.props || {};

    // Extrai device type do User-Agent (sem armazenar o UA completo — PII risk)
    const ua = req.headers.get("user-agent") || "";
    const device = /Mobile|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
    const browser = /Edge/i.test(ua) ? "edge"
      : /Chrome/i.test(ua) ? "chrome"
      : /Firefox/i.test(ua) ? "firefox"
      : /Safari/i.test(ua) ? "safari"
      : "other";

    // IP anonimizado (primeiros 3 octetos) — não é PII
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const anonIp = rawIp === "unknown" ? "unknown" : rawIp.split(".").slice(0, 3).join(".") + ".0";

    const sb: any = getSupabaseServer();
    const { error } = await sb.from("analytics_events").insert({
      event_name: eventName,
      path: typeof path === "string" ? path.slice(0, 500) : null,
      offer_slug: props.offer_slug || null,
      props: { ...props, device, browser, anon_ip: anonIp },
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Tabela pode não existir — falha silenciosamente
      return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
