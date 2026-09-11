import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data } = await (supabase.from("app_settings") as any)
      .select("*")
      .eq("key", "pix_config")
      .maybeSingle();
    return NextResponse.json({ config: data?.value || null });
  } catch (e: any) {
    return NextResponse.json({ config: null, error: e.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pixKey, merchantName, merchantCity } = body;

    if (!pixKey || !merchantName) {
      return NextResponse.json({ error: "pixKey and merchantName are required" }, { status: 400 });
    }

    const config = {
      pixKey,
      merchantName: merchantName.slice(0, 25),
      merchantCity: (merchantCity || "Recife").slice(0, 15),
    };

    const supabase = getSupabaseServer();
    const existing = await (supabase.from("app_settings") as any).select("id").eq("key", "pix_config").maybeSingle();

    if (existing.data) {
      await (supabase.from("app_settings") as any).update({ value: config, updated_at: new Date().toISOString() }).eq("key", "pix_config");
    } else {
      await (supabase.from("app_settings") as any).insert({ key: "pix_config", value: config });
    }

    return NextResponse.json({ ok: true, config });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
