"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (uses anon key, persisted session for auth).
 * Only use in Client Components.
 *
 * IMPORTANT: We use COOKIE storage (not localStorage) so that the Next.js
 * middleware (which runs server-side) can read the session and verify auth.
 * Without this, the login flow loops: client sees session in localStorage,
 * but middleware sees no cookie → redirects back to login.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

// Cookie storage adapter — syncs Supabase session to browser cookies
// so server-side middleware can read it.
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"),
    );
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === "undefined") return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${key}=${encodeURIComponent(value)}` +
      `; path=/; max-age=${60 * 60 * 24 * 7}` +
      `; SameSite=Lax${secure}`;
  },
  removeItem: (key: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  },
};

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (cached) return cached;

  cached = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: cookieStorage,
      storageKey: `sb-${PROJECT_REF}-auth-token`,
    },
  });
  return cached;
}

export const supabase = getSupabaseBrowser();
