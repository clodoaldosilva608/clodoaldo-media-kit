import { getRequest } from "@tanstack/react-start/server";

const FALLBACK_ORIGIN = "https://clodoaldo-silva.lovable.app";

const EXPLICIT_ALLOW = new Set<string>([
  "https://clodoaldo-silva.lovable.app",
]);

function isAllowedOrigin(candidate: string): boolean {
  try {
    const u = new URL(candidate);
    if (EXPLICIT_ALLOW.has(u.origin)) return true;
    if (u.hostname.endsWith(".lovable.app")) return true;
    if (u.hostname.endsWith(".lovable.dev")) return true;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolve the callback origin server-side to prevent open-redirect abuse
 * via client-supplied `origin` values in Stripe success/cancel URLs.
 */
export function resolveOrigin(): string {
  const req = getRequest();
  if (!req?.headers) return FALLBACK_ORIGIN;

  const originHeader = req.headers.get("origin");
  if (originHeader && isAllowedOrigin(originHeader)) {
    return new URL(originHeader).origin;
  }

  const referer = req.headers.get("referer");
  if (referer && isAllowedOrigin(referer)) {
    return new URL(referer).origin;
  }

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    const candidate = `${proto}://${host}`;
    if (isAllowedOrigin(candidate)) return new URL(candidate).origin;
  }

  return FALLBACK_ORIGIN;
}
