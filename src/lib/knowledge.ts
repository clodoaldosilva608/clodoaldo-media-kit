import { createClient } from "@supabase/supabase-js";
import type { KnowledgeCardData } from "@/components/knowledge/knowledge-card";

/**
 * Server-only Supabase client using service_role key.
 * Never expose this to the client — use NEXT_PUBLIC_SUPABASE_* for browser.
 */
function createServerClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface KnowledgeItemRow {
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  category: string;
  type: string;
  access_type: string;
  price_cents: number;
  currency: string;
  estimated_minutes: number;
  difficulty: string;
  status: string;
}

/**
 * Lista todos os knowledge_items publicados, ordenados por created_at ASC.
 * Sem auth — usa RLS public policy. Em modo anon, acess_type="free" fica liberado,
 * paid fica "locked" no client (hasAccess=false).
 */
export async function listPublishedKnowledgeItems(): Promise<KnowledgeCardData[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("knowledge_items")
    .select(
      "slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty, status",
    )
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[knowledge] listPublishedKnowledgeItems error:", error.message);
    return [];
  }

  return (data ?? []).map((row: KnowledgeItemRow) => ({
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover_url: row.cover_url,
    category: row.category,
    type: row.type,
    access_type: row.access_type,
    price_cents: row.price_cents,
    currency: row.currency,
    estimated_minutes: row.estimated_minutes,
    difficulty: row.difficulty,
    chapter_count: 0,
    hasAccess: row.access_type === "free",
    progress_pct: 0,
    completed: false,
  }));
}
