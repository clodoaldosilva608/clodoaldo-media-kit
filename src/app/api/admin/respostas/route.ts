import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
const pool = new pg.Pool({ connectionString: `postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
const RULES: { pattern: RegExp; classification: string; action: string; next_step: string }[] = [
  { pattern: /pode mandar|manda|me mostra|quero ver/i, classification: 'permission_to_send', action: 'Enviar resumo/demo', next_step: 'Enviar explicação curta' },
  { pattern: /tenho interesse|quero saber mais|me interessa/i, classification: 'interessado', action: 'Enviar contexto', next_step: 'Qualificar' },
  { pattern: /quanto custa|preço|valor/i, classification: 'pricing_question', action: 'Dar contexto antes do preço', next_step: 'Oferecer demo' },
  { pattern: /vamos marcar|reunião|agendar/i, classification: 'meeting_ready', action: 'Oferecer horários', next_step: 'Enviar calendário' },
  { pattern: /não tenho interesse|não precisa|para de mandar/i, classification: 'opt_out', action: 'Confirmar opt-out', next_step: 'Parar contato' },
  { pattern: /ok|👍|😉|😊/i, classification: 'ambiguous', action: 'Clarificar', next_step: 'Follow-up' },
];
function classify(text: string) { for (const r of RULES) if (r.pattern.test(text)) return { classification: r.classification, action: r.action, next_step: r.next_step }; return { classification: 'unclassified', action: 'Revisar manualmente', next_step: 'Humano' }; }
export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 500), 2000);
    const client = await pool.connect();
    try { const result = await client.query(`SELECT r.*, p.name as prospect_name FROM public.clodoaldo_respostas r LEFT JOIN public.clodoaldo_prospects p ON r.prospect_id = p.id ORDER BY r.received_at DESC LIMIT $1`, [limit]); return NextResponse.json({ data: result.rows }); }
    finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ data: [], error: e.message }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let cls = body.classification, action = body.action_taken, next = body.next_step;
    if (!cls && body.message_text) { const r = classify(body.message_text); cls = r.classification; action = r.action; next = r.next_step; }
    const client = await pool.connect();
    try {
      const result = await client.query(`INSERT INTO public.clodoaldo_respostas (prospect_id, message_text, classification, action_taken, next_step) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [body.prospect_id, body.message_text, cls, action, next]);
      const statusMap: Record<string,string> = { permission_to_send: 'qualified', interessado: 'qualified', meeting_ready: 'qualified', opt_out: 'lost', pricing_question: 'contacted', ambiguous: 'contacted' };
      await client.query(`UPDATE public.clodoaldo_prospects SET replied = true, reply_classification = $1, reply_text = $2, reply_at = now(), status = $3, updated_at = now() WHERE id = $4`, [cls, body.message_text, statusMap[cls]||'contacted', body.prospect_id]);
      return NextResponse.json({ data: result.rows[0], classification: cls, action, next_step: next });
    } finally { client.release(); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
