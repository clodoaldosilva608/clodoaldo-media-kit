import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/envios/chart?days=14
 *
 * Returns envios grouped by day for the last N days (default 14).
 * Response: [{ date: "DD/MM", envios: number, respostas: number }]
 *
 * Used by the home admin chart widget.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") || 14), 1), 90);

    const client = await getMeucorrePool().connect();
    try {
      // Build series for last N days
      const now = new Date();
      const daysArr = Array.from({ length: days }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (days - 1 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      // Query envios by day
      const startDate = daysArr[0].toISOString();
      const enviosRes = await client.query(
        `SELECT
            DATE(sent_at AT TIME ZONE 'America/Sao_Paulo') as dia,
            count(*)::int as total
         FROM public.clodoaldo_envios
         WHERE sent_at >= $1
         GROUP BY DATE(sent_at AT TIME ZONE 'America/Sao_Paulo')`,
        [startDate]
      );
      const enviosByDay: Record<string, number> = {};
      for (const row of enviosRes.rows) {
        enviosByDay[row.dia] = row.total;
      }

      // Query respostas by day
      const respostasRes = await client.query(
        `SELECT
            DATE(received_at AT TIME ZONE 'America/Sao_Paulo') as dia,
            count(*)::int as total
         FROM public.clodoaldo_respostas
         WHERE received_at >= $1
         GROUP BY DATE(received_at AT TIME ZONE 'America/Sao_Paulo')`,
        [startDate]
      );
      const respostasByDay: Record<string, number> = {};
      for (const row of respostasRes.rows) {
        respostasByDay[row.dia] = row.total;
      }

      // Build chart data
      const chartData = daysArr.map((d) => {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
        return {
          date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          envios: enviosByDay[dateStr] || 0,
          respostas: respostasByDay[dateStr] || 0,
        };
      });

      // Totals
      const totalEnvios = chartData.reduce((s, d) => s + d.envios, 0);
      const totalRespostas = chartData.reduce((s, d) => s + d.respostas, 0);
      const replyRate = totalEnvios > 0 ? Math.round((totalRespostas / totalEnvios) * 100) : 0;

      return NextResponse.json({
        data: chartData,
        totals: {
          envios: totalEnvios,
          respostas: totalRespostas,
          replyRate,
          days,
        },
      });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, data: [], totals: {} }, { status: 500 });
  }
}
