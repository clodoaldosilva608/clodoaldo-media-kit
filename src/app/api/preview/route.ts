import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { generatePreviewHTML } from "@/lib/preview-generator";

/**
 * GET /api/preview?lead=<prospect_id>
 * Returns a full HTML page with the site preview for the lead.
 * Shareable link: https://clodoaldo.vercel.app/api/preview?lead=<id>
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead");
    if (!leadId) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Try to fetch from clodoaldo_prospects (meucorre DB via pg)
    // Fall back to fetching from supabase if available
    let leadData: any = null;

    // Try meucorre prospects table via pg pool
    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT name, niche, category, formatted_address, city, phone, whatsapp, website, instagram, facebook, rating, user_ratings_total, lat, lng FROM public.clodoaldo_prospects WHERE id = $1",
          [leadId],
        );
        if (result.rows.length > 0) {
          leadData = result.rows[0];
        }
      } finally {
        client.release();
      }
    } catch {
      // meucorre not available — try local fallback
    }

    if (!leadData) {
      const notFoundHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview não encontrado</title></head><body style="background:#1b1b1b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center"><h1>Preview não encontrado</h1><p>O lead pode ter sido removido ou o link é inválido.</p><p style="margin-top:20px"><a href="https://clodoaldo.vercel.app" style="color:#FE7B02">← Voltar ao site</a></p></div></body></html>`;
      return new NextResponse(notFoundHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = generatePreviewHTML(leadData);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
