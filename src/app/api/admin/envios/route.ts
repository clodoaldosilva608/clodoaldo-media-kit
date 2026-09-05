import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
const pool = new pg.Pool({ connectionString: `postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 500), 2000);
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT e.*, p.name as prospect_name, p.phone as prospect_phone FROM public.clodoaldo_envios e LEFT JOIN public.clodoaldo_prospects p ON e.prospect_id = p.id ORDER BY e.sent_at DESC LIMIT $1`, [limit]);
      return NextResponse.json({ data: result.rows });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ data: [], error: e.message }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await pool.connect();
    try {
      const result = await client.query(`INSERT INTO public.clodoaldo_envios (prospect_id, message_text, message_variant, status, provider_msg_id, destination_jid, error, campaign) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [body.prospect_id, body.message_text||null, body.message_variant||'recomendada', body.status||'pending', body.provider_msg_id||null, body.destination_jid||null, body.error||null, body.campaign||'agency_outbound_v1']);
      return NextResponse.json({ data: result.rows[0] });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
