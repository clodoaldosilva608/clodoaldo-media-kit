import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/respostas/export?prospect_id=UUID&format=csv
 *
 * Exports the reply history for a single lead.
 * Formats: csv (default), json
 *
 * CSV columns: received_at, classification, message_text, action_taken, next_step
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const prospectId = url.searchParams.get("prospect_id");
    const format = (url.searchParams.get("format") || "csv").toLowerCase();

    if (!prospectId) {
      return NextResponse.json({ error: "Missing prospect_id" }, { status: 400 });
    }

    const client = await getMeucorrePool().connect();
    try {
      // Fetch prospect info
      const prospectRes = await client.query(
        `SELECT id, name, niche, city, whatsapp, phone, formatted_address, status, rating, website
         FROM public.clodoaldo_prospects WHERE id = $1::uuid`,
        [prospectId]
      );
      if (prospectRes.rows.length === 0) {
        return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
      }
      const prospect = prospectRes.rows[0];

      // Fetch replies
      const repliesRes = await client.query(
        `SELECT id, message_text, classification, action_taken, next_step, received_at
         FROM public.clodoaldo_respostas
         WHERE prospect_id = $1::uuid
         ORDER BY received_at ASC`,
        [prospectId]
      );
      const replies = repliesRes.rows;

      if (format === "json") {
        return NextResponse.json({
          prospect,
          replies,
          exported_at: new Date().toISOString(),
        });
      }

      // CSV format
      const escapeCsv = (s: any) => {
        if (s === null || s === undefined) return "";
        const str = String(s);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvLines: string[] = [];
      // Header: prospect info
      csvLines.push(`# Exportação de histórico do lead`);
      csvLines.push(`# Lead: ${escapeCsv(prospect.name)}`);
      csvLines.push(`# Nicho: ${escapeCsv(prospect.niche)}`);
      csvLines.push(`# Cidade: ${escapeCsv(prospect.city)}`);
      csvLines.push(`# WhatsApp: ${escapeCsv(prospect.whatsapp || prospect.phone)}`);
      csvLines.push(`# Status: ${escapeCsv(prospect.status)}`);
      csvLines.push(`# Total de respostas: ${replies.length}`);
      csvLines.push(`# Exportado em: ${new Date().toLocaleString("pt-BR")}`);
      csvLines.push("");
      // CSV header
      csvLines.push("Data/Hora,Classificação,Mensagem,Ação tomada,Próximo passo");
      // Rows
      for (const r of replies) {
        csvLines.push([
          escapeCsv(new Date(r.received_at).toLocaleString("pt-BR")),
          escapeCsv(r.classification || "unclassified"),
          escapeCsv(r.message_text),
          escapeCsv(r.action_taken || ""),
          escapeCsv(r.next_step || ""),
        ].join(","));
      }

      const csv = csvLines.join("\n");
      const safeName = (prospect.name || "lead").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
      const dateStr = new Date().toISOString().slice(0, 10);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="historico_${safeName}_${dateStr}.csv"`,
        },
      });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
