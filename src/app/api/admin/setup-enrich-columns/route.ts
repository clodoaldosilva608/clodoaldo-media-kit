import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * POST /api/admin/setup-enrich-columns
 *
 * Verifica se a tabela clodoaldo_prospects tem as colunas de enriquecimento.
 * Se não, retorna o DDL pra rodar manualmente no SQL Editor do meucorre.
 */
export async function POST() {
  try {
    const pool = getMeucorrePool();

    // Verificar colunas existentes
  const r = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'clodoaldo_prospects'
      AND column_name IN ('owner_name', 'owner_email', 'instagram_handle', 'enriched_at', 'enrichment_data')
      ORDER BY column_name
    `);

    const existing = r.rows.map((row: any) => row.column_name);
    const missing = ["owner_name", "owner_email", "instagram_handle", "enriched_at", "enrichment_data"]
      .filter(c => !existing.includes(c));

    if (missing.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Todas colunas de enriquecimento já existem",
        columns: existing,
      });
    }

    // Construir DDL com as colunas que faltam
    const ddlParts: string[] = [];
    if (missing.includes("owner_name")) ddlParts.push("ADD COLUMN IF NOT EXISTS owner_name TEXT");
    if (missing.includes("owner_email")) ddlParts.push("ADD COLUMN IF NOT EXISTS owner_email TEXT");
    if (missing.includes("instagram_handle")) ddlParts.push("ADD COLUMN IF NOT EXISTS instagram_handle TEXT");
    if (missing.includes("enriched_at")) ddlParts.push("ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ");
    if (missing.includes("enrichment_data")) ddlParts.push("ADD COLUMN IF NOT EXISTS enrichment_data JSONB DEFAULT '{}'::jsonb");

    const ddl = `ALTER TABLE clodoaldo_prospects ${ddlParts.join(", ")};`;

    return NextResponse.json({
      success: false,
      needs_manual_setup: true,
      missing_columns: missing,
      ddl,
      instructions: "Execute o DDL acima no SQL Editor do meucorre Supabase (https://supabase.com/dashboard/project/pjetmhsevohaqtqfbxrr/sql/new). Depois rode este endpoint de novo pra confirmar.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
