import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("additional_services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const { data, error } = await supabase
      .from("additional_services")
      .insert({
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
        description: body.description || null,
        category: body.category || "custom",
        price_cents: body.price_cents || 0,
        price_label: body.price_label || null,
        kiwify_checkout_url: body.kiwify_checkout_url || null,
        visible_to_client: body.visible_to_client ?? true,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
