import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.pathname.split("/").pop();
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("products_catalog")
      .select("*")
      .eq("whatsapp_sku", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ product: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
