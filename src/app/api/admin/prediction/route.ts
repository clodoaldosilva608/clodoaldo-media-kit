import { NextRequest, NextResponse } from "next/server";
import { predictClose } from "@/lib/close-prediction";

/**
 * GET /api/admin/prediction?lead_id=<uuid> — Predição de fechamento (Sprint C)
 *
 * Modelo determinístico e explicável baseado em leads históricos semelhantes.
 * Somente leitura (Nível 1) — não altera nenhum dado.
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead_id");
    if (!leadId) {
      return NextResponse.json({ error: "Parâmetro 'lead_id' é obrigatório" }, { status: 400 });
    }
    const result = await predictClose(leadId);
    if ("error" in result) {
      return NextResponse.json(result, { status: result.error === "Lead não encontrado" ? 404 : 500 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[prediction] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
