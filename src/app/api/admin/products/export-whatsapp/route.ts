import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/products/export-whatsapp
 *
 * Exporta catálogo no formato CSV compatível com import do WhatsApp Business.
 * Formato: nome, descricao, preco, sku
 *
 * WhatsApp Business aceita import via "Business Tools > Catalog > Import".
 */
export async function GET() {
  try {
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("products_catalog")
      .select("name, description, price_label, price_cents, whatsapp_sku, category, icon")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;

    const products = data || [];
    // WhatsApp Business CSV format: Name, Description, Price (number), SKU, URL (optional)
    // IMPORTANT: use semicolon as separator (Brazilian Excel/Sheets default) and dot for decimals
    // to avoid breaking on commas in price like "1.700,00"
    const rows: string[] = [
      "Name;Description;Price;SKU",
    ];
    for (const p of products) {
      const name = escapeCsv(p.name, ";");
      const desc = escapeCsv(`${p.icon || ""} ${p.description || ""}`.trim(), ";");
      const price = (p.price_cents / 100).toFixed(2); // dot decimal (e.g. 1700.00)
      const sku = escapeCsv(p.whatsapp_sku || "", ";");
      rows.push(`${name};${desc};${price};${sku}`);
    }
    const csv = rows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="catalogo-whatsapp-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeCsv(s: string, sep: string = ","): string {
  if (!s) return "";
  // Quote if contains separator, quote, or newline
  const needsQuote = new RegExp(`[${sep}"\\n]`).test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}
