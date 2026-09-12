import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

/**
 * GET  /api/admin/products              → lista todos
 * POST /api/admin/products              → cria novo
 * PATCH /api/admin/products             → atualiza por id
 * DELETE /api/admin/products?id=<uuid>  → remove
 */
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  price_cents: z.number().int().nonnegative().default(0),
  price_label: z.string().max(120).optional().nullable(),
  category: z.string().max(60).default("site"),
  icon: z.string().max(10).default("✅"),
  is_recurring: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(100),
  whatsapp_sku: z.string().max(120).optional().nullable(),
});

export async function GET() {
  try {
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("products_catalog")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid", details: parsed.error.flatten() }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { id, ...rest } = parsed.data;
    if (id) {
      // Update
      const { data, error } = await sb.from("products_catalog")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ product: data });
    } else {
      // Create
      const { data, error } = await sb.from("products_catalog")
        .insert(rest)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ product: data });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Same as POST with id — kept for semantic
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { error } = await sb.from("products_catalog").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
