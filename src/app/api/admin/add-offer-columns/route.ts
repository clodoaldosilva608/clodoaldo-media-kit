import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/add-offer-columns
 *
 * Adiciona 3 colunas à tabela offers (idempotente):
 * - exclusions JSONB (lista de "o que NÃO está incluído")
 * - indicative_timeline TEXT ("prazo indicativo")
 * - bonus JSONB (lista de bônus inclusos)
 *
 * Rota admin única pra setup. Pode ser removida após execução.
 */
export async function POST(req: NextRequest) {
  try {
    const sb: any = getSupabaseServer();

    // Testar se as colunas já existem tentando um select
    const { data: test, error: testErr } = await sb.from("offers")
      .select("exclusions, indicative_timeline, bonus")
      .limit(1);

    if (!testErr) {
      return NextResponse.json({
        success: true,
        message: "Colunas já existem na tabela offers",
        columns: ["exclusions", "indicative_timeline", "bonus"],
      });
    }

    // Se erro de coluna não existe, instruir criação manual
    return NextResponse.json({
      success: false,
      needs_manual_setup: true,
      message: "Colunas ainda não existem. Execute o DDL no SQL Editor do Supabase.",
      ddl: `-- Execute no SQL Editor do Supabase (projeto jckkbsluvbejioyrlcfo)

ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS exclusions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS indicative_timeline TEXT,
  ADD COLUMN IF NOT EXISTS bonus JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.offers.exclusions IS 'Lista de itens que NÃO estão inclusos na oferta (transparência)';
COMMENT ON COLUMN public.offers.indicative_timeline IS 'Prazo indicativo de entrega (ex: "5-7 dias úteis")';
COMMENT ON COLUMN public.offers.bonus IS 'Lista de bônus inclusos na oferta';`,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
