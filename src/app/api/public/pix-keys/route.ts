import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/public/pix-keys
 *
 * Retorna as chaves PIX ativas configuradas no admin.
 * Público (sem auth) — chaves PIX são públicas por natureza (você compartilha
 * pra receber pagamento). Não expõe IDs internos.
 *
 * Resposta:
 *   keys: Array<{
 *     id: string,
 *     label: string,        // ex: "C6 Bank - Chave Aleatória"
 *     type: string,         // phone | email | cpf | random | brcode
 *     value: string,        // a chave PIX em si
 *     typeLabel: string,    // ex: "Telefone", "Aleatória"
 *     bank?: string,        // extraído do label se começar com nome de banco
 *     merchantName: string,
 *     merchantCity: string,
 *   }>
 *   defaultKeyId: string
 */
const TYPE_LABELS: Record<string, string> = {
  phone: "Telefone",
  email: "Email",
  cpf: "CPF",
  random: "Aleatória",
  brcode: "PIX Copia e Cola",
};

export async function GET() {
  try {
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("app_settings")
      .select("value")
      .eq("key", "pix_keys")
      .maybeSingle();
    if (error) throw error;

    const config = data?.value || { keys: [], defaultKeyId: null };
    const keys = (config.keys || []).map((k: any) => {
      // Extrai nome do banco do label se começar com palavra + " - "
      // ex: "C6 Bank - Chave Aleatória" → bank: "C6 Bank"
      const bankMatch = (k.label || "").match(/^([^–-]+)\s*[-–]\s*(.+)$/);
      const bank = bankMatch ? bankMatch[1].trim() : null;

      return {
        id: k.id,
        label: k.label || "Chave PIX",
        type: k.type,
        typeLabel: TYPE_LABELS[k.type] || k.type,
        value: k.value,
        bank,
        merchantName: k.merchantName || "Clodoaldo Silva",
        merchantCity: k.merchantCity || "Recife",
      };
    });

    return NextResponse.json({
      keys,
      defaultKeyId: config.defaultKeyId,
      total: keys.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, keys: [] }, { status: 500 });
  }
}
