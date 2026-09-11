import { NextResponse } from "next/server";

/**
 * GET /api/admin/system/envs
 *
 * Retorna status real (configured | missing | not_used) das variáveis de ambiente críticas.
 * Não expõe valores — apenas booleano de presença.
 *
 * Auditoria P0-B: resolver alerta falso de "Kiwify pendente" quando na verdade
 * o usuário decidiu não usar Kiwify.
 */
export async function GET() {
  const envs = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    google_maps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    telegram: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
    cron_secret: !!process.env.CRON_SECRET,
    google_oauth_client: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    kiwify_token: !!process.env.KIWIFY_API_TOKEN,
    kiwify_webhook: !!process.env.KIWIFY_WEBHOOK_SECRET,
    kiwify_product: !!process.env.KIWIFY_DEFAULT_PRODUCT_ID,
    pixel_active: false,
  };

  try {
    const { getMeucorrePool } = await import("@/lib/meucorre-db");
    const pool = getMeucorrePool();
    if (pool) {
      const r = await pool.query("SELECT COUNT(*)::int AS n FROM pixel_config WHERE active = true");
      envs.pixel_active = (r.rows[0]?.n ?? 0) > 0;
    }
  } catch {}

  const status = {
    core: envs.supabase_url && envs.supabase_service ? "ok" : "broken",
    analytics: envs.pixel_active ? "ok" : "pending_pixel",
    kiwify: envs.kiwify_token && envs.kiwify_webhook && envs.kiwify_product
      ? "ok"
      : "not_configured",
    email: envs.google_oauth_client ? "ok" : "pending_google",
    telegram: envs.telegram ? "ok" : "pending_telegram",
  };

  return NextResponse.json({ envs, status });
}
