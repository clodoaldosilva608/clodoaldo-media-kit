import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPixMessage, PixConfig } from "@/lib/pix";

/**
 * POST /api/admin/pix/generate
 * Body: { amount: 297.00, description?: "Site Destra Vastudy" }
 *
 * Returns: { brCode, qrUrl, amountFormatted, message }
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, description } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }

    // Get PIX config
    const supabase = getSupabaseServer();
    const { data } = await (supabase.from("app_settings") as any).select("value").eq("key", "pix_config").maybeSingle();
    const config: PixConfig = data?.value;

    if (!config?.pixKey) {
      return NextResponse.json({ error: "PIX não configurado. Acesse /admin/settings para configurar." }, { status: 400 });
    }

    const result = buildPixMessage({ config, amount, description });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
