import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
const pool = new pg.Pool({ connectionString: `postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
export async function GET(req: NextRequest) {
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const client = await pool.connect();
    try {
      const statusCounts = await client.query("SELECT status, count(*) as count FROM public.clodoaldo_prospects GROUP BY status ORDER BY count DESC");
      const todayEnvios = await client.query("SELECT count(*) as total, count(*) FILTER (WHERE status = 'sent') as confirmed, count(*) FILTER (WHERE status = 'failed') as failed FROM public.clodoaldo_envios WHERE sent_at >= $1 AND sent_at <= $2", [todayStart, todayEnd]);
      const todayRespostas = await client.query("SELECT count(*) as total, count(*) FILTER (WHERE classification = 'permission_to_send') as permission, count(*) FILTER (WHERE classification = 'interessado') as interested, count(*) FILTER (WHERE classification = 'meeting_ready') as meeting, count(*) FILTER (WHERE classification = 'opt_out') as opt_outs FROM public.clodoaldo_respostas WHERE received_at >= $1 AND sent_at <= $2", [todayStart, todayEnd]);
      const opportunities = await client.query("SELECT count(*) as count FROM public.clodoaldo_prospects WHERE web_dev_opportunity = true");
      return NextResponse.json({ date: todayStart.toISOString().slice(0,10), status_breakdown: statusCounts.rows, today: { sends: todayEnvios.rows[0]||{}, replies: todayRespostas.rows[0]||{} }, opportunities: opportunities.rows[0]?.count||0 });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
