import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Rate Limiting (in-memory, per-instance) ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

// ─── Public admin routes that need auth ───
const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Rate limiting for public POST APIs ──
  if (req.method === "POST") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (pathname.startsWith("/api/checkout") || pathname.startsWith("/api/funding")) {
      if (!checkRateLimit(`checkout:${ip}`, 10, 60_000)) {
        return NextResponse.json({ error: "Muitas requisições. Tente em 1 minuto." }, { status: 429 });
      }
    }
    if (pathname.startsWith("/api/quiz/")) {
      if (!checkRateLimit(`quiz:${ip}`, 20, 60_000)) {
        return NextResponse.json({ error: "Muitas requisições. Tente em 1 minuto." }, { status: 429 });
      }
    }
    if (pathname.startsWith("/api/affiliates/")) {
      if (!checkRateLimit(`affiliate:${ip}`, 30, 60_000)) {
        return NextResponse.json({ error: "Rate limit excedido" }, { status: 429 });
      }
    }
  }

  // ── Rate limiting for admin APIs ──
  if (pathname.startsWith("/api/admin/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(`admin:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: "Rate limit admin excedido" }, { status: 429 });
    }
  }

  // ── Rate limiting for cron endpoints (stricter — should only be called by Vercel Cron) ──
  if (pathname.startsWith("/api/cron/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(`cron:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Cron rate limit" }, { status: 429 });
    }
  }

  // ── Admin auth: protect /admin/* (except /admin/login) and /api/admin/* ──
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (isAdminPage || isAdminApi) {
    // Get session token from cookie or Authorization header
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("sb-access-token")?.value ||
      req.cookies.get("sb-jckkbsluvbejioyrlcfo-auth-token")?.value;

    // ── CRON SECRET bypass: internal calls from /api/cron/* to /api/admin/* ──
    // O cron auto-prospect chama /api/admin/prospect/search internamente.
    // Essas chamadas server-to-server usam CRON_SECRET no header Authorization.
    if (isAdminApi && authHeader?.startsWith("Bearer ")) {
      const candidate = authHeader.slice(7);
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret && candidate === cronSecret) {
        // Bypass auth — request is from internal cron
        return NextResponse.next();
      }
    }

    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (cookieToken) {
      // Supabase stores the session as URL-encoded JSON in the cookie.
      // Try to decode → parse → extract access_token.
      try {
        const decoded = decodeURIComponent(cookieToken);
        const parsed = JSON.parse(decoded);
        token = parsed?.access_token || null;
      } catch {
        // Fallback: cookie might be the raw token (non-JSON, non-encoded)
        token = cookieToken;
      }
    }

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      // Redirect to admin login for page requests
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the JWT with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    // Use service_role key for the role check — the anon key is blocked by
    // RLS on user_roles table. Service role bypasses RLS server-side only
    // and is never exposed to the browser.
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      const key = supabaseServiceKey || supabaseAnonKey!;
      const supabase = createClient(supabaseUrl, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: userData, error: userError } = await supabase.auth.getUser(token);

      if (userError || !userData.user) {
        if (isAdminApi) {
          return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        if (isAdminApi) {
          return NextResponse.json({ error: "Acesso negado — requer role admin" }, { status: 403 });
        }
        // For page requests, show access denied
        const deniedUrl = new URL("/admin/login", req.url);
        deniedUrl.searchParams.set("error", "access_denied");
        deniedUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/checkout/:path*",
    "/api/funding/:path*",
    "/api/quiz/:path*",
    "/api/affiliates/:path*",
    "/api/cron/:path*",
  ],
};
