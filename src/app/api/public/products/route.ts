import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { type PublicProduct } from "@/lib/product-catalog";

/**
 * GET /api/public/products
 *
 * Lista produtos ativos do catálogo para exibição na landing page.
 * Público (sem auth) — não expõe campos sensíveis.
 */
export async function GET() {
  try {
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("products_catalog")
      .select("id, name, description, price_cents, price_label, category, icon, is_recurring, image_path, whatsapp_sku")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const products = (data || []) as PublicProduct[];
    return NextResponse.json({
      products,
      total: products.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, products: [] }, { status: 500 });
  }
}
