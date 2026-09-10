import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/envios?limit=200
 * Returns the send log joined with prospect name/niche/city.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const limit = Math.min(Number(url.searchParams.get("limit") || 200), 2000);
    const campaign = url.searchParams.get("campaign");
    const status = url.searchParams.get("status");

    const client = await getMeucorrePool().connect();
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let idx = 1;
      if (campaign) {
        conditions.push(`e.campaign = $${idx++}`);
        params.push(campaign);
      }
      if (status && status !== "all") {
        conditions.push(`e.status = $${idx++}`);
        params.push(status);
      }
      const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
      params.push(limit);
      const result = await client.query(
        `SELECT
            e.id,
            e.prospect_id,
            e.sent_at,
            e.message_text,
            e.message_variant,
            e.status,
            e.provider_msg_id,
            e.destination_jid,
            e.error,
            e.campaign,
            p.name AS prospect_name,
            p.niche AS prospect_niche,
            p.city AS prospect_city,
            p.whatsapp AS prospect_whatsapp,
            p.phone AS prospect_phone
         FROM public.clodoaldo_envios e
         LEFT JOIN public.clodoaldo_prospects p ON p.id = e.prospect_id::uuid
         ${where}
         ORDER BY e.sent_at DESC
         LIMIT $${idx}`,
        params
      );
      return NextResponse.json({ data: result.rows, error: null });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message });
  }
}

/**
 * POST /api/admin/envios
 * Body: { prospect_id, message_text, message_variant, status, campaign?, destination_jid?, provider_msg_id?, error? }
 * Registers a new send in the log. Used by the bulk-send flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prospect_id && !body.prospect_name) {
      return NextResponse.json(
        { error: "Missing prospect_id or prospect_name" },
        { status: 400 }
      );
    }
    const client = await getMeucorrePool().connect();
    try {
      const cols = [
        "prospect_id",
        "message_text",
        "message_variant",
        "status",
        "campaign",
        "destination_jid",
        "provider_msg_id",
        "error",
        "sent_at",
      ];
      const values: any[] = [];
      const placeholders: string[] = [];
      let idx = 1;
      for (const col of cols) {
        if (body[col] !== undefined) {
          values.push(body[col]);
          placeholders.push(`$${idx++}`);
        }
      }
      const colNames = cols.filter((c) => body[c] !== undefined);

      // If no sent_at provided, default to now()
      let sql: string;
      if (colNames.includes("sent_at")) {
        sql = `INSERT INTO public.clodoaldo_envios (${colNames.join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`;
      } else {
        sql = `INSERT INTO public.clodoaldo_envios (${colNames.join(",")}, sent_at) VALUES (${placeholders.join(",")}, now()) RETURNING *`;
      }
      const result = await client.query(sql, values);

      // Also update prospect status to "contacted" if the send was successful
      if (body.prospect_id && body.status === "sent") {
        try {
          await client.query(
            `UPDATE public.clodoaldo_prospects
             SET status = 'contacted',
                 last_contact_at = now(),
                 contacted_count = COALESCE(contacted_count, 0) + 1,
                 updated_at = now()
             WHERE id = $1::uuid`,
            [body.prospect_id]
          );
        } catch {
          // Non-critical — log entry still created
        }
      }

      return NextResponse.json({ data: result.rows[0], ok: true });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
