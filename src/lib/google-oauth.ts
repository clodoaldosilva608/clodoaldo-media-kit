/**
 * Google OAuth 2.0 infrastructure.
 * 
 * Escopos: gmail.send, spreadsheets, drive.file, calendar
 * (YouTube e Blogger usam API Key — não precisam de OAuth)
 */

import { getSupabaseServer } from "@/lib/supabase-server";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || "https://clodoaldo.vercel.app/api/oauth/google/callback";

// Escopos OAuth (sem youtube/blogger — eles usam API Key)
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/calendar",
].join(" ");

export function getOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  return resp.json();
}

interface StoredToken {
  id: string;
  user_email: string | null;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
  created_at: string;
  updated_at: string;
}

export async function getStoredTokens(): Promise<StoredToken | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("google_oauth_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as StoredToken) || null;
}

export async function saveTokens(tokens: any): Promise<StoredToken | null> {
  const supabase = getSupabaseServer();
  await (supabase.from("google_oauth_tokens") as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data } = await (supabase.from("google_oauth_tokens") as any)
    .insert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + (tokens.expires_in || 3600) * 1000,
      scope: tokens.scope || "",
      token_type: tokens.token_type || "Bearer",
      user_email: tokens.user_email || null,
    })
    .select()
    .single();
  return (data as unknown as StoredToken) || null;
}

export async function refreshAccessToken(): Promise<string | null> {
  const stored = await getStoredTokens();
  if (!stored?.refresh_token) return null;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: stored.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const data = await resp.json();
  if (!data.access_token) return null;

  const supabase = getSupabaseServer();
  await (supabase.from("google_oauth_tokens") as any)
    .update({
      access_token: data.access_token,
      expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
    })
    .eq("id", stored.id);

  return data.access_token as string;
}

export async function getValidAccessToken(): Promise<string | null> {
  const stored = await getStoredTokens();
  if (!stored?.access_token) return null;

  if (stored.expiry_date && Date.now() > stored.expiry_date - 300000) {
    return await refreshAccessToken();
  }
  return stored.access_token;
}

export async function isConnected(): Promise<boolean> {
  const stored = await getStoredTokens();
  return !!stored?.access_token;
}

export async function getConnectedEmail(): Promise<string | null> {
  const stored = await getStoredTokens();
  return stored?.user_email || null;
}

export async function disconnect() {
  const supabase = getSupabaseServer();
  await supabase.from("google_oauth_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
