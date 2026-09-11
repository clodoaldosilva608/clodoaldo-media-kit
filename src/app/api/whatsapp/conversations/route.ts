import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/whatsapp/conversations
 *
 * Returns recent conversations (from respostas + envios tables).
 * Groups by prospect to show as conversation threads.
 */
export async function GET() {
  try {
    const client = await getMeucorrePool().connect();
    try {
      // Get recent replies grouped by prospect
      const repliesRes = await client.query(
        `SELECT
            r.id,
            r.prospect_id,
            r.message_text,
            r.classification,
            r.received_at,
            p.name as prospect_name,
            p.niche,
            p.city,
            p.whatsapp,
            p.phone
         FROM public.clodoaldo_respostas r
         LEFT JOIN public.clodoaldo_prospects p ON p.id = r.prospect_id::uuid
         ORDER BY r.received_at DESC
         LIMIT 100`
      );

      // Get recent sends
      const sendsRes = await client.query(
        `SELECT
            e.id,
            e.prospect_id,
            e.message_text,
            e.message_variant,
            e.status,
            e.sent_at,
            e.campaign,
            p.name as prospect_name,
            p.whatsapp,
            p.phone
         FROM public.clodoaldo_envios e
         LEFT JOIN public.clodoaldo_prospects p ON p.id = e.prospect_id::uuid
         ORDER BY e.sent_at DESC
         LIMIT 100`
      );

      // Group by prospect_id into conversations
      const conversations: Record<string, any> = {};

      // Add sends
      for (const send of sendsRes.rows) {
        const pid = send.prospect_id || "unknown";
        if (!conversations[pid]) {
          conversations[pid] = {
            prospectId: pid,
            prospectName: send.prospect_name || "Desconhecido",
            whatsapp: send.whatsapp || send.phone || "",
            messages: [],
          };
        }
        conversations[pid].messages.push({
          type: "sent",
          text: send.message_text,
          timestamp: send.sent_at,
          variant: send.message_variant,
          status: send.status,
          campaign: send.campaign,
        });
      }

      // Add replies
      for (const reply of repliesRes.rows) {
        const pid = reply.prospect_id || "unknown";
        if (!conversations[pid]) {
          conversations[pid] = {
            prospectId: pid,
            prospectName: reply.prospect_name || "Desconhecido",
            whatsapp: reply.whatsapp || reply.phone || "",
            niche: reply.niche,
            city: reply.city,
            messages: [],
          };
        }
        conversations[pid].messages.push({
          type: "received",
          text: reply.message_text,
          timestamp: reply.received_at,
          classification: reply.classification,
        });
      }

      // Sort messages within each conversation by timestamp
      const conversationList = Object.values(conversations).map((c: any) => {
        c.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        c.lastMessage = c.messages[c.messages.length - 1];
        return c;
      });

      // Sort conversations by last message
      conversationList.sort((a: any, b: any) => {
        return new Date(b.lastMessage?.timestamp).getTime() - new Date(a.lastMessage?.timestamp).getTime();
      });

      return NextResponse.json({ conversations: conversationList });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ conversations: [], error: e.message });
  }
}
