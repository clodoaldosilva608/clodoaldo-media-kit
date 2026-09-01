import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const inputSchema = z.object({
  app_slug: z.string().optional(),
});

export type PublicSupporter = {
  id: string;
  app_slug: string;
  tier_id: string;
  supporter_name: string;
  supporter_message: string | null;
  amount_cents: number;
  created_at: string;
};

export const listPublicSupporters = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data ?? {}))
  .handler(async ({ data }): Promise<PublicSupporter[]> => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    let q = supabase
      .from("supporters")
      .select("id, app_slug, tier_id, supporter_name, supporter_message, amount_cents, created_at")
      .eq("status", "paid")
      .eq("public_display", true)
      .order("amount_cents", { ascending: false })
      .limit(500);

    if (data.app_slug) q = q.eq("app_slug", data.app_slug);

    const { data: rows, error } = await q;
    if (error || !rows) return [];
    return rows as PublicSupporter[];
  });
